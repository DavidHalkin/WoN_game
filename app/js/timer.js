function datediff(warTime)
{
	nowTime=Math.round(new Date().getTime() / 1000);
	var day = parseInt((warTime - nowTime) / 86400);
	if ((warTime - nowTime)<0) return '';
	var dayRes = (warTime  - nowTime) % 86400;
	if(day < 1) day = '';
	var hour = parseInt(dayRes / 3600);
	var hourRes = dayRes % 3600;
	if(hour < 1) hour = '0';
	var minute = parseInt(hourRes / 60);
	var minuteRes = hourRes % 60;
	if(minute < 10) minute = '0' + minute;
	var second = parseInt(minuteRes);
	if(second < 10) second = '0' + second;
	//element.innerHTML = day + ', ';
	var day = day + ' ' + hour +  ':' +  minute +  ':' + second;
	
	return day;
}
 