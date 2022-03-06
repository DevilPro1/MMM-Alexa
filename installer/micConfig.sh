#!/bin/bash
# +-------------------+
# | npm run MicConfig |
# +-------------------+

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

# module name
Installer_module="MMM-GoogleAssistant"

# use beep request questions ?
Installer_beep=true

echo

# Audio out/in checking
Installer_info "Checking Speaker and Microphone..."

Installer_checkmicv2
echo

if [ ! -z "$plug_rec" ]; then
  Installer_warning "This is your Alexa micConfig working configuration :"
  if [ "$os_name" == "raspbian" ]; then
    Installer_warning "Remember: if you are using RPI, it's better to use arecord program"
  fi
  echo
  Installer_warning "micConfig: {"
  Installer_warning "  device: \"$plug_rec\""
  Installer_warning "},"
fi

echo

