module.exports = {
    lengthOfList: (list = []) => list.length,
    eq: (val1, var2) => val1 === val2,
    dateString: (isoString) => new Date(isoString).toLocaleDateString(),
}