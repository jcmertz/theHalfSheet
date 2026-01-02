---
layout: post
title: Getting Up And Running
date: 2026-01-01 16:08:26 -0500
categories:
---
Okay! It's been a bit fiddly getting this running but I now have it behaving as I want it to! My pipeline for posting is now this:

I have an Obsidian vault setup on my local machine that is setup in a folder that is also a Jekyll project and [git repo](https://github.com/jcmertz/theHalfSheet). I am then using a custom shell script (below), which is triggered by the [Obsidian community plugin "Shell Commands"](https://github.com/Taitava/obsidian-shellcommands) based on a hot key, to do the following:

- Stage and commit any changes to the repo
- Push to the remote Github repo
- Open an SSH connection to my webserver, Shelob
- On the webserver, change to the correct directory and then do a git pull from the Github repo

```
#!/bin/bash

  

#publish.sh

# This script exists to move files from the local obsidian vault/jekyl project, through github, to the remote server Shelob.

# it is dependent on SSH to shelob already being established on the machine.

  
  

echo "Publishing..."

git add . &> /dev/null

git commit -m "Publishing Changes Via Shell Script" &> /dev/null

git push &> /dev/null

sleep 2

ssh shelob "cd theHalfSheet; git pull" &> /dev/null

echo "Publish Complete!"
```

This ends up working out very well, and creates a simple pipeline where I can write blog posts in Obsidian, and then from Obsidian trigger a hotkey to push the changes to the webserver where Jekyll will automatically pick them up and server them.

I have also added a Node script and a Ruby plugin to the Jekyll server. The purpose of this is to remap filenames for image attachments from the standard Obsidian saves them in to the full filepath Jekyll wants to see to serve them correctly. This script was mostly generated with help from ChatGPT. I am sure there will be some more conversation about AI on this blog as we go forward.

Overall this seems to be working well for now. We shall see how it continues into the year!