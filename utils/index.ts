function getPartialChance(totalChance: number, times: number) {
  return 1 - (1 - totalChance) ** (1 / times);
}

export {
  getPartialChance,
};
