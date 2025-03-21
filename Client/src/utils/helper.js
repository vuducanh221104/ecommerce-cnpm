export function currencyFormat(num) {
  return (
    "$" +
    Math.round(num)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  );
}
