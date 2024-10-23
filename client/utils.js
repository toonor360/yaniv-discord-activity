const cardsToNumber = new Map();

for (let cardIndex = 1; cardIndex <= 13; cardIndex++) {
  switch (cardIndex) {
    case 1:
      cardsToNumber.set(`AC`, cardIndex);
      cardsToNumber.set(`AD`, cardIndex);
      cardsToNumber.set(`AH`, cardIndex);
      cardsToNumber.set(`AS`, cardIndex);
      break;
    case 11:
      cardsToNumber.set(`JC`, cardIndex);
      cardsToNumber.set(`JD`, cardIndex);
      cardsToNumber.set(`JH`, cardIndex);
      cardsToNumber.set(`JS`, cardIndex);
      break;
    case 12:
      cardsToNumber.set(`QC`, cardIndex);
      cardsToNumber.set(`QD`, cardIndex);
      cardsToNumber.set(`QH`, cardIndex);
      cardsToNumber.set(`QS`, cardIndex);
      break;
    case 13:
      cardsToNumber.set(`KC`, cardIndex);
      cardsToNumber.set(`KD`, cardIndex);
      cardsToNumber.set(`KH`, cardIndex);
      cardsToNumber.set(`KS`, cardIndex);
      break;
    default:
      cardsToNumber.set(`${cardIndex}C`, cardIndex);
      cardsToNumber.set(`${cardIndex}D`, cardIndex);
      cardsToNumber.set(`${cardIndex}H`, cardIndex);
      cardsToNumber.set(`${cardIndex}S`, cardIndex);
      break;
  }
}

export { cardsToNumber };
