#!/bin/bash
# +---------+
# | updater |
# +---------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh
if $prompt; then
  Installer_info "Welcome to Alexa updater !"
  echo
fi

cd ~/MagicMirror/modules/MMM-Alexa
# deleting package.json because npm install add/update package
rm -f package.json package-lock.json

Installer_info "Updating..."


git reset --hard HEAD
git pull
#fresh package.json
git checkout package.json
cd ~/MagicMirror/modules/MMM-GoogleAssistant/node_modules

Installer_info "Deleting ALL @bugsounet libraries..."

rm -rf @bugsounet
cd ~/MagicMirror/modules/MMM-Alexa

Installer_info "Ready for Updating..."

# launch installer
npm install
