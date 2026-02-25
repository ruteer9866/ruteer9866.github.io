---

layout: page

title: k-NN Interactive Demo

permalink: /knn/

---



<div class="knn-controls">

&nbsp; <label>

&nbsp;   n (nodes):

&nbsp;   <input id="nSlider" type="range" min="2" max="200" value="30">

&nbsp;   <span id="nVal">30</span>

&nbsp; </label>



&nbsp; <label>

&nbsp;   k:

&nbsp;   <input id="kSlider" type="range" min="1" max="20" value="5">

&nbsp;   <span id="kVal">5</span>

&nbsp; </label>



&nbsp; <button id="randomizeBtn" type="button">Randomize</button>

&nbsp; <label class="knn-toggle">

&nbsp;   <input id="directedChk" type="checkbox">

&nbsp;   Directed

&nbsp; </label>

</div>



<div class="knn-canvas-wrap">

&nbsp; <canvas id="knnCanvas" width="900" height="520"></canvas>

</div>



<p class="knn-hint">

&nbsp; Drag nodes to move them. Adjust <b>n</b> and <b>k</b> to rebuild the k-NN graph.

</p>



<link rel="stylesheet" href="{{ '/assets/css/knn-demo.css' | relative\_url }}">

<script src="{{ '/assets/js/knn-demo.js' | relative\_url }}"></script>

