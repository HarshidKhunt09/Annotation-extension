export const getDateRange = async () => {
  const dateRegex =
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}$/;
  const dates = document
    .getElementsByClassName('selected-date-range-value')[0]
    .textContent.split(' - ');
  const endDate = dates[1];
  let startDate = dates[0];

  if (!dateRegex.test(startDate)) {
    const year = endDate.split(', ')[1];
    startDate = `${startDate}, ${year}`;
  }

  return [new Date(startDate), new Date(endDate)];
};

export const diffDays = (d2, d1) => {
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
};
