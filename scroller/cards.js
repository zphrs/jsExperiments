// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

import hsl from './hsl.js';
const sects=document.getElementsByTagName('section');
const cardHolder = document.getElementsByClassName('cards')[0];
const hueRange = [360, 120];

const hsls = hueRange.map(elem=>new hsl(elem, .79, .72));
const roundCorners = e=> {
	for (var i = 0; i<sects.length; i++)
	{
		const e = sects[i];
		let newCol = hsls[0].transitionBetweenMultiple(hsls, i/(sects.length - 1));
		e.style.backgroundColor = newCol;
		e.style.paddingLeft = '';
		e.style.paddingRight = '';
		e.style.paddingTop = '';
		e.style.paddingBottom = '';
		e.style.marginTop = '';
		e.style.clipPath = '';
		const portrait = cardHolder.clientWidth < cardHolder.clientHeight;
		const top = portrait?e.getBoundingClientRect().top:e.getBoundingClientRect().left;
		const widthHeight = portrait?cardHolder.clientHeight:cardHolder.clientWidth;
		if (true)
		{
			const unit = portrait?'vw':'vh';

			const newBorderRad = 20*(top/widthHeight);
			if (portrait)
			{
				e.style.paddingTop =`${newBorderRad+unit}`;
				e.style.marginTop = `-${newBorderRad+unit}`;
				e.style.paddingLeft ='';
				e.style.marginLeft = '';
			}
			else
			{
				e.style.paddingLeft =`${newBorderRad+unit}`;
				e.style.marginLeft = `-${newBorderRad+unit}`;
				e.style.paddingTop = '';
				e.style.marginTop = '';
			}
			const newClipPath = Math.floor(widthHeight/(top)*100);
			if (newClipPath!==Infinity && newClipPath>0)
			{
				newCol = newCol.copy();
				newCol.l = .8;
				if (portrait)
				{
					e.style.clipPath = `circle(${newClipPath}vw at 50% ${newClipPath}vw`
					e.style.background = `radial-gradient(circle at 50% ${newClipPath}vw, ${e.style.backgroundColor} calc(${newClipPath}vw - 15px), ${newCol} calc(${newClipPath}vw - 0px), ${newCol} ${newClipPath}vw)`
				}
				else
				{
					e.style.clipPath = `circle(${newClipPath}vh at ${newClipPath}vh 50%)`;
					e.style.background = `radial-gradient(circle at ${newClipPath}vh 50%, ${e.style.backgroundColor} calc(${newClipPath}vh - 15px), ${newCol} calc(${newClipPath}vh - 0px), ${newCol} ${newClipPath}vh)`
				}
			}
			else
			{
				e.style.background = e.style.backgroundColor;
				e.style.clipPath = '';
			}
			if (e.previousElementSibling !== null) 
			{
				if (portrait)
				{
					e.previousElementSibling.style.paddingBottom = e.style.paddingTop;
					e.previousElementSibling.style.paddingRight = '';
				}
				else
				{
					e.previousElementSibling.style.paddingBottom = '';
					e.previousElementSibling.style.paddingRight = e.style.paddingLeft;
				}
			}
		}
	}
}
roundCorners();

window.addEventListener('scroll', roundCorners);
window.addEventListener('resize', roundCorners);
cardHolder.addEventListener('scroll', roundCorners);
for (var i = 0; i<sects.length; i++)
{
	const sect = sects[i];
	sect.addEventListener('pointerup', event=>{
		cardHolder.scrollTo({
			top: sect.offsetTop - (parseFloat(sect.style.marginTop)/90)*cardHolder.clientWidth,
			left: sect.offsetLeft - (parseFloat(sect.style.marginLeft)/90)*cardHolder.clientHeight,
			behavior: 'smooth'
		})
	})
}
