// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE

class hsl {
	constructor(h, s, l, a)
	{
		this.h = h;
		this.s = s;
		this.l = l;
		this.a = a ?? 1;
	}
	/*
	amount should be between 0 and 1.
	*/
	transitionBetween(rgb2, amount)
	{
		return new hsl(this.h*(1-amount)+rgb2.h*(amount), this.s*(1-amount)+rgb2.s*(amount), this.l*(1-amount)+rgb2.l*(amount));
	}
	copy()
	{
		return new hsl(this.h, this.s, this.l);
	}
	transitionBetweenMultiple(listOfRgbs, amount)
	{
		var colorDistance = 1/(listOfRgbs.length-1);
		if (amount == 0)
			return listOfRgbs[0];
		if (amount >= 1)
			return listOfRgbs[listOfRgbs.length-1];
		var transitioningBetween = amount/colorDistance;
		var index = Math.floor(transitioningBetween);
		return listOfRgbs[index].transitionBetween(listOfRgbs[index+1], transitioningBetween-index);
	}
	toString()
	{
		if (this.a === 1)
		{
			return 'hsl('+this.h+", "+this.s*100+"%, "+this.l*100+"%)";
		}
		return 'hsla('+this.h+", "+this.s*100+"%, "+this.l*100+"%, "+this.a+")";
	}
}
export default hsl;