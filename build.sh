# Simple bash script to build the Gnome Shell extension

echo "Zipping the extension..."
zip -r docker_status@mibear42.zip . -x *.git*

echo "Done building."
