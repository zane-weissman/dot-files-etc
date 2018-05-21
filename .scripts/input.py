from lib.cli import run
import json
import subprocess 

sinks = run('list-sinks')

active_id = sinks.items()[-1][1] # don't question

dmenu_in = open("temp/dmenu_in.txt","w")
sink_ids = {}
for n,s in sinks.items()[:-1]:
    sink_ids[s['properties']['alsa.card_name']]=n
    dmenu_in.write(s['properties']['alsa.card_name'] + "\n")

dmenu_in.close()
dmenu_in = open("temp/dmenu_in.txt","r")

choice = subprocess.check_output("dmenu",stdin=dmenu_in)
choice_id = sink_ids[choice[:-1]] # chop last character which is always a \n


ret = subprocess.call("pacmd set-default-sink " + choice_id, shell=True)
inputs = subprocess.check_output("($(pacmd list-sink-inputs | grep index | awk '{print $2}'))")
