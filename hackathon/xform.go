package main

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
)

//middle may be empty, may be several words
type fullName struct {
	first, last, middle string
}

var BAD_NAME = errors.New("Can't understand name!")

const AMT_COLUMN = 8
const AMT_SHRED = 9

const ADDR_COLUMN = 2
const ADDR_SHRED = 3

const SOURCE_COLUMN = 0
const SOURCE_SHRED = 1

const DOC_COLUMN_IMAGE=24

const GIFT_DATA = "https://s3.amazonaws.com/uploads.hipchat.com/12029/159927/5mmgvcgk6reaw19/D%20Form%20700--Gift%20Disclosures.csv"
const INCOME_DATA = "https://s3.amazonaws.com/uploads.hipchat.com/12029/159927/ctbo9yywhusuv38/C%20Form%20700--Income%20Reporting.csv"

//Put your code here... this is an example
func yourCode_gift(name *fullName, recs [][]string) {
	sum := 0.0
	max := -1.0
	donor := ""
	donor_shred:=""
	disclosure :=""
	addr:=""
	
	for _, i := range recs {
		if len(i) > AMT_COLUMN && i[AMT_COLUMN] != "--blank--" {
			dollar := strings.Replace(i[AMT_COLUMN], "$", "", -1)
			f, err := strconv.ParseFloat(dollar, 64)
			if err == nil {
				sum += f
				if f > max {
					max = f
					donor = i[SOURCE_COLUMN]
					donor_shred = i[SOURCE_SHRED]
					if len(i)>DOC_COLUMN_IMAGE {
						disclosure = i[DOC_COLUMN_IMAGE]
					}
					addr=i[ADDR_COLUMN]
				}
			}
		} else {
			filtered:=[]string{}
			for s, _ := range i {
				if s%2==0 {
					filtered = append(filtered,i[s])
				}
			}
			//fmt.Printf("\t\t%s\n", strings.Join(filtered, "##"))
		}
	}
	if sum >= 100.0 {
		fmt.Printf("%s, %s %s, %d,%4.2f,\"%s\",%s,\"%s\",\"\",%s\n", name.last, name.first,
			name.middle, len(recs), sum, donor, donor_shred, addr, disclosure)
	}
}

const INCOME_COLUMN = 8
const WHOLE_DOC_COLUMN = 14
var SPOUSE_COL_LIST = []int {4,10}
var SPOUSE_TEXT=[]string{"spouse", "husband", "wife", "domestic partner"}

func yourCode(name *fullName, recs [][]string) {
	source := ""
	addr:=""
	
	for _, i := range recs {
		hit:=false
		Spouse: for _, j:=range SPOUSE_COL_LIST {
			t:=i[j]
			t=strings.ToLower(t)
			for _, s:=range SPOUSE_TEXT {
				if strings.Contains(t,s) {
					hit=true
					//fmt.Printf("HIT! %s vs %s (on %d)\n", t,s,j)
					break Spouse
				}
			} 
		}
		if hit && i[INCOME_COLUMN]!="--blank--" {
			if i[SOURCE_COLUMN]!="--blank--" {
				source=i[SOURCE_COLUMN]
			}
			if i[ADDR_COLUMN]!="--blank--" {
				addr=i[ADDR_COLUMN]
			}
			fmt.Printf("%s, %s %s, %s, \"%s\", \"%s\",%s\n", name.last, name.first,
				name.middle, i[INCOME_COLUMN], source, addr, i[WHOLE_DOC_COLUMN])
		}
	}
}

func main() {
	resp, err := http.Get(INCOME_DATA)
	if err != nil {
		fmt.Printf("error reading raw data: %s", err)
		return
	}
	defer resp.Body.Close()

	reader := csv.NewReader(resp.Body)
	done := false
	recs := [][]string{}

	var current *fullName
	for !done {
		record, err := reader.Read()

		//check for EOF or other IO error
		if err != nil {
			if err != io.EOF {
				fmt.Printf("error reading CSV: %s\n", err)
				break
			}
			done = true
			continue
		}

		//convert to a name we can deal with, or skip with error
		f, err := convertName(record[0])
		if err != nil {
			continue
		}

		//check for new name
		if current == nil || *current != *f {
			if current != nil {
				prefilter(current, recs)
			}
			current = f
			recs = [][]string{record}
		} else {
			recs = append(recs, record)
		}
	}
	//last record still needed
	prefilter(current, recs)
}

func prefilter(name *fullName, recs [][]string) {
	nonBlanks := [][]string{}

	for _, i := range recs {
		allBlank := true
		for col, j := range i {
			if col == 0 {
				continue
			}
			if j != "--blank--" {
				allBlank = false
				break
			}
		}
		if !allBlank {
			nonBlanks = append(nonBlanks, i[1:])
		}
	}
	yourCode(name, nonBlanks)
}

// convert a name from the data into a well-formed struct... try to be clever about
// last names like "Di Matteo" or "Van Persie"
func convertName(name string) (*fullName, error) {
	if !strings.HasPrefix(name, "R_") {
		fmt.Printf("Can't understand the unexpected name: %s\n", name)
		return nil, BAD_NAME
	}
	if !strings.HasSuffix(name, ".pdf") {
		fmt.Printf("Can't understand the unexpected name: %s\n", name)
		return nil, BAD_NAME
	}
	name = name[2:]
	name = name[0 : len(name)-4]

	pieces := strings.Split(name, "-")
	if len(pieces) != 2 && len(pieces) != 3 { //hyphenated last name!
		fmt.Printf("Can't understand expected split of 'page' part of name: %s\n", name)
		return nil, BAD_NAME
	}
	if !strings.HasPrefix(pieces[len(pieces)-1], "page") {
		fmt.Printf("Can't understand expected 'page' part of name: %s\n", name)
		return nil, BAD_NAME
	}

	name = strings.Join(pieces[0:len(pieces)-1], " ")
	full := strings.Split(name, "_")
	if len(full) < 2 {
		fmt.Printf("Can't understand the full name: %+v\n", full)
		return nil, BAD_NAME
	}

	f := &fullName{}

	//special case reorg
	if len(full) > 3 && (strings.HasPrefix(full[0], "Van") || strings.HasPrefix(full[0], "Di")) {
		f.last = strings.Join(full[0:2], " ")
		f.first = full[2]
		f.middle = strings.Join(full[3:], " ")
	} else {
		f.last = full[0]
		f.first = full[1]
		if len(full) > 2 {
			f.middle = strings.Join(full[2:], " ")
		}
	}
	return f, nil
}
