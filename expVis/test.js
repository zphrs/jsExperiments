console.log(parenthasizer('1+3/2'))
function strToExp(str)
{
	// take the non-parenthasized +-/* and parenthesize with recursion
	// ex. 1+2+3 -> ((1+2)+3)
	function parenthasizer(str, runningOutput) // todo - follow PEMDAS order!!
    {
        regex = /^\(?([+*\-%])?(.+?)([+*\-%])(.+?)((?:[+*\-%])?.*)\)?/
        match = regex.exec(str)
        console.log(match, str)
        if(match)
        {
            if (match[1])
            {
                return parenthasizer(match[5], "((" + runningOutput + match[1] + match[2] + ")" + match[3] + match[4] + ")")
            }
            return parenthasizer(match[5], '(' + match[2] + match[3] + match[4] + ')')
        }
        else
        {
            return runningOutput+str;
        }
    }
    // group by parentheses from left to right. When closing parentheses reached, make equation
    // ex. ((1+2)+3) -> new Exp(new Exp(1, '+', 2), '+', 3)
    // ex. (1+2) -> new Exp(1, '+', 2)
    // ex. ((3*1)+(2*3)) -> new Exp(new Exp(3, '*', 1), '+', new Exp(2, '*', 3))
    function groupByParentheses(str)
    {
        let result = new Exp(str);
        let groups = []
        let currentLevel = 0
        let maxLevel = 0
        for (var i = 0; i < str.length; i++)
        {
            if (str[i] == "(")
            {
                currentLevel++
            }
            else if (str[i] == ")")
            {
                currentLevel--
            }
            groups[currentLevel] += str[i]
            if (currentLevel == 0)
            {
                
            }
        }
    }
    return new Exp(groupByParentheses(str))
}