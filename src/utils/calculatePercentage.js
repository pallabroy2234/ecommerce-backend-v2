/**
 * @description         Calculates the percentage change from last month to this month.
 * @param thisMonth -   The value for the current month.
 * @param lastMonth -   The value for the previous month.
 * @returns            The percentage change, rounded to the nearest integer.
 *                 If lastMonth is 0, returns thisMonth * 100 as a special case.
 * */
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percentage = (thisMonth / lastMonth) * 100;
    return Math.round(percentage);
};
// const percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
// return percentage.toFixed(0);
