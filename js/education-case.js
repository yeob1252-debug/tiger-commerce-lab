/* Progressive enhancement: evidence and CTAs stay visible without JS. */
(()=>{'use strict';const items=[...document.querySelectorAll('[data-education-case]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(reduced.matches||!('IntersectionObserver' in window))return;
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.add('case-arrived');observer.unobserve(entry.target);}},{threshold:.16});
items.forEach(item=>observer.observe(item));
reduced.addEventListener('change',event=>{if(event.matches){observer.disconnect();items.forEach(item=>item.classList.remove('case-arrived'));}});
})();
