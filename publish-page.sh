#!/bin/bash

git stash
git checkout gh-pages
git checkout master javascript/js_widget_example.html
git reset HEAD javascript/js_widget_example.html
git checkout master javascript/new_job.js
git reset HEAD javascript/new_job.js
mv javascript/js_widget_example.html index.html
mv javascript/*.js .
git add index.html
git add *.js
git commit -m "Automatic pages update"
git push origin gh-pages
git checkout master
git stash pop

