if [ "$(git status -s)" ] ; then
   echo "Changes detected. Commiting."
   git add .
   git commit -am "Save known VINs"
   git push
else
   echo "No changes detected."
fi