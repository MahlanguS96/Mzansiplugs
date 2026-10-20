MZANSI PLUGS - WHERE TO EDIT - SIMPLE GUIDE
==========================================

You have 3 files:
1. index.html  -> Structure (don't touch unless you know)
2. style.css   -> Colors and design
3. jobs.js     -> YOUR JOBS DATABASE - EDIT HERE!
4. script.js   -> Logic (don't touch)

WHERE TO ADD JOBS MANUALLY (2 ways):

WAY 1 - EASY (for beginners):
- Open the site live -> Click "+ Add Job (Admin Only)" at bottom -> Fill form -> It saves.

WAY 2 - PROPER (recommended):
- Open jobs.js in VS Code or Notepad
- Copy one job block and paste at bottom, change details
- Save, then upload again to Netlify

WHERE TO PASTE MONETAG CODE:

In index.html, you will see comments:

<!-- PASTE YOUR MONETAG CODE HERE - In the HEAD section -->
Paste your Monetag script tag there. Example:
<script src="https://alwingulla.com/88/tag.min.js" data-zone="12345"></script>

Also replace the 2 ad placeholders:
<div class="ad-placeholder">
   PASTE YOUR MONETAG / ADSENSE CODE HERES
</div>

Just delete that text and paste your ad code inside.

HOW TO DEPLOY FREE ON NETLIFY:

1. Go to app.netlify.com -> Sign up free
2. Drag and drop the whole folder "mzansi-plugs"
3. Done! You get URL: https://mzansiplugs-xxxxx.netlify.app
4. You can change name in Netlify settings -> Domain.

That's it. No React, no npm, no complicated stuff.

