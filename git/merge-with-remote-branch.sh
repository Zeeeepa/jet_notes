git checkout salesferry-merge

git fetch "git@gitlab.com:macanta/macanta.git" SalesFerry
git checkout -b "jethro4/macanta-salesferry" FETCH_HEAD

git fetch origin
git checkout salesferry-merge
git merge --no-ff "jethro4/macanta-salesferry"

git push
git branch -D jethro4/macanta-salesferry
