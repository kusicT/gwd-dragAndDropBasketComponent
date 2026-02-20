 /** Implementation of Drag and Drop gesture plus drop basket feature. */
if (window.customElements && window.customElements.define) {
  class DaDBasket2 extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      // volano vzdy kdyz je element vlozen do DOM
           
      // po load eventu nastavi pro vsechny baskety na vsech accepted a not accepted objektech draggable true
      document.addEventListener("DOMContentLoaded", initiateDraggables);
      this.addEventListener("drop", handleDrop);
      this.addEventListener("dragover", handleDragOver);
      gwd.acceptedDroppedEvent = new Event("acceptedDropped"); 
      gwd.rejectedDroppedEvent = new Event("rejectedDropped");
      // check if it's a touch device to allow for possible future touch-specific adjustments
      this._isTouchDevice = isTouchDevice();
    }

    disconnectedCallback() {
      //spusteno, kdyz se element odstrani ze stranky
      document.removeEventListener("DOMContentLoaded", initiateDraggables);
      this.removeEventListener("drop", handleDrop);
      this.removeEventListener("dragover", handleDragOver);
    }
    
    attributeChangedCallback() {
    // volano vzdy, kdyz se zmeni nejaky atribut elementu
    }

    static get observedAttributes() {
    }
    
  } // konec definice cele tridy
  
  
  // Ostatni funkce komponenty
  function initiateDraggables() {
    const DaDBaskets2 = document.querySelectorAll("dad-basket2");
    DaDBaskets2.forEach((DaDBasket2) => {
      let draggables = parseIds(DaDBasket2, "acceptedIds");
      draggables.forEach(initiateOneDraggable);
      draggables = parseIds(DaDBasket2, "rejectedIds");
      draggables.forEach(initiateOneDraggable);
    });
  }

  function parseIds(el, attrName) {
    const raw = el.getAttribute(attrName);
    if (!raw) return [];
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  
  function initiateOneDraggable(draggable) {
    if(document.getElementById(draggable)) {
      const d = document.getElementById(draggable);
      // Pokud se jedna o uzivatelsky element nastavi to draggable pro vlozeny nativni element
      // Take to k nemu povesi udalosti pro dragging, ale pouzije id nadrizeneho elementu
      // pro dataTransfer takze existujici logika basketu bude fungovat
      let targetEl = d;
      if (d.nativeElement) targetEl = d.nativeElement;

      // attach draggable to the actual element that will be dragged
      if (targetEl.getAttribute("draggable") !== "true") targetEl.setAttribute("draggable", "true");
    
      if (!targetEl._dadDraggableListenersAdded) {
        // dragstart: compute dx/dy relative to host element and set transfer id to host id
        targetEl.addEventListener("dragstart", function(e) {
          // use host element for id and bounding rect if we're on native element
          const host = d;
          // ensure dataTransfer contains the host id (what baskets expect)
          e.dataTransfer.setData("text", host.id);

          // compute mouse offset relative to host bounding rect
          const rect = host.getBoundingClientRect();
          const dx = e.pageX - rect.left;
          const dy = e.pageY - rect.top;
          e.dataTransfer.setData("dx", dx);
          e.dataTransfer.setData("dy", dy);

          // visual feedback
          host.style.opacity = '0.2';          
        });
        
        // dragend: restore opacity on host
        targetEl.addEventListener("dragend", function(e) {
          const host = d;
          host.style.opacity = '1';          
        });

        // keep placeholder for possible move handling
        targetEl.addEventListener("drag", handleDrag);
        
        // mark that we've added listeners to avoid doing it multiple times if the same id is used in multiple baskets
        targetEl._dadDraggableListenersAdded = true;
      }

      if (isTouchDevice() && !targetEl._dadTouchListenersAdded) {
        targetEl.addEventListener("touchstart", function(e) {
          handleTouchStart(e, d);
        }, { passive: false });
        targetEl.addEventListener("touchmove", handleTouchMove, { passive: false });
        targetEl.addEventListener("touchend", handleTouchEnd, { passive: false });
        targetEl.addEventListener("touchcancel", handleTouchEnd, { passive: false });
        targetEl._dadTouchListenersAdded = true;
      }
    }
  }
  
  function handleDrag(e) {
    // not used now
  }
  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    const dropped = document.getElementById(e.dataTransfer.getData("text"));
    processDropTarget(e.target, dropped, e);
  }

  function processDropTarget(target, dropped, e) {
    switch (isAcceptedOrRejectedOrNone(dropped, target)) {
      case "accepted":
          if (target.getAttribute("showAccepted")) resultVisualisation(target, dropped, target.getAttribute("showAccepted"), e);
          target.dispatchEvent(gwd.acceptedDroppedEvent);
          break;
      case "rejected":
          if (target.getAttribute("showRejected")) resultVisualisation(target, dropped, target.getAttribute("showRejected"), e);
          target.dispatchEvent(gwd.rejectedDroppedEvent);
          break;
      case "none":
        if (target.getAttribute("showWrongBasket")) {
            if (target.getAttribute("showWrongBasket") == "Event") {
              resultVisualisation(target, dropped, target.getAttribute("showRejected"), e);
              target.dispatchEvent(gwd.rejectedDroppedEvent);
            }
        }
        break;
      default:
          break;    
    }
  }

  function isAcceptedOrRejectedOrNone(dropped,basket) {
    const ac = parseIds(basket, "acceptedIds");
    const re = parseIds(basket, "rejectedIds");
    if (ac.includes(dropped.id)) return "accepted";
    if (re.includes(dropped.id)) return "rejected";
    return "none";
  }

  function resultVisualisation(t,o,m,e) {
    if (m == "Insert") {
      o.style.position = "static";  
      t.appendChild(o);
    } else if (m == "Stay") {
        const dx = e.dataTransfer.getData("dx");
        const dy = e.dataTransfer.getData("dy");
        o.style.top = (e.pageY - dy) + "px";
        o.style.left = (e.pageX  - dx) + "px";       
    } else if (m == "Stay Forever") {
        const dx = e.dataTransfer.getData("dx");
        const dy = e.dataTransfer.getData("dy");
        o.style.top = (e.pageY - dy) + "px";
        o.style.left = (e.pageX  - dx) + "px";
        o.style.pointerEvents = "none"; // disable pointer events to allow dropping in same place again    
    } else if (m == "Vanish") {
        const dx = e.dataTransfer.getData("dx");
        const dy = e.dataTransfer.getData("dy");
        o.style.top = (e.pageY - dy) + "px";
        o.style.left = (e.pageX  - dx) + "px";          
        o.style.pointerEvents = "none"; // disable pointer events to allow dropping in same place again
        // wait few milliseconds to let it automatically set opacity after draganddrop, then fade out to vanish
        setTimeout(() => {
          o.style.transition = "opacity .9s";
          o.style.opacity = "0";
        }, 100);
        setTimeout(() => {
          o.style.display = "none";
        }, 1000);   
    } else return;
  }

  let _dadTouchState = null;

  function handleTouchStart(e, host) {
    if (!isTouchDevice()) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = host.getBoundingClientRect();
    _dadTouchState = {
      host,
      startRectLeft: rect.left,
      startRectTop: rect.top,
      dx: touch.pageX - rect.left,
      dy: touch.pageY - rect.top,
      lastPageX: touch.pageX,
      lastPageY: touch.pageY,
      lastClientX: touch.clientX,
      lastClientY: touch.clientY,
      prevOpacity: host.style.opacity,
      prevTransform: host.style.transform,
      prevPointerEvents: host.style.pointerEvents,
      prevWillChange: host.style.willChange
    };
    host.style.opacity = "0.2";
    host.style.willChange = "transform";
    host.style.pointerEvents = "none";
    e.preventDefault();
  }

  function handleTouchMove(e) {
    if (!_dadTouchState) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    _dadTouchState.lastPageX = touch.pageX;
    _dadTouchState.lastPageY = touch.pageY;
    _dadTouchState.lastClientX = touch.clientX;
    _dadTouchState.lastClientY = touch.clientY;
    const left = touch.pageX - _dadTouchState.dx;
    const top = touch.pageY - _dadTouchState.dy;
    const deltaX = left - _dadTouchState.startRectLeft;
    const deltaY = top - _dadTouchState.startRectTop;
    _dadTouchState.host.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (!_dadTouchState) return;
    const touch = (e.changedTouches && e.changedTouches[0]) || null;
    const host = _dadTouchState.host;
    const pageX = touch ? touch.pageX : _dadTouchState.lastPageX;
    const pageY = touch ? touch.pageY : _dadTouchState.lastPageY;
    const clientX = touch ? touch.clientX : _dadTouchState.lastClientX;
    const clientY = touch ? touch.clientY : _dadTouchState.lastClientY;
    const basket = findBasketFromPoint(clientX, clientY);

    host.style.transform = _dadTouchState.prevTransform || "";
    host.style.pointerEvents = _dadTouchState.prevPointerEvents || "";
    host.style.willChange = _dadTouchState.prevWillChange || "";

    if (basket) {
      const dataTransfer = {
        getData: function(key) {
          if (key === "text") return host.id;
          if (key === "dx") return _dadTouchState.dx;
          if (key === "dy") return _dadTouchState.dy;
          return "";
        }
      };
      const eventLike = {
        dataTransfer,
        target: basket,
        pageX,
        pageY
      };
      processDropTarget(basket, host, eventLike);
    }

    host.style.opacity = _dadTouchState.prevOpacity || "1";
    _dadTouchState = null;
    e.preventDefault();
  }

  function findBasketFromPoint(clientX, clientY) {
    let el = document.elementFromPoint(clientX, clientY);
    while (el) {
      if (el.tagName && el.tagName.toLowerCase() === "dad-basket2") return el;
      el = el.parentElement;
    }
    return null;
  }

  // testing if the device supports touch to allow for possible future touch-specific adjustments
  function isTouchDevice() {
    return ("ontouchstart" in window) || (navigator && navigator.maxTouchPoints > 0);
  }
  customElements.define('dad-basket2', DaDBasket2);
  
}

