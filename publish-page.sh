#!/bin/bash

git stash
git checkout gh-pages
git checkout master javascript/js_widget_example.html
git reset HEAD javascript/js_widget_example.html
mv javascript/js_widget_example.html index.html
git add index.html
git commit -m "Automatic pages update"
git push origin gh-pages
git checkout master
git stash pop

