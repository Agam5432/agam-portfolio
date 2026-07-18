function classifyQuery(query) {
  const q = query.toLowerCase();

  if (/latest|most recent|newest|current project|current role|current company|abhi ka|latest kaam/.test(q)) {
    return "temporal_latest";
  }
  if (/first|earliest|initial company|started (his|her|their) career|pehli company|pehla project/.test(q)) {
    return "temporal_first";
  }
  if (/all (projects|skills|experience)|list (of )?(projects|skills)|every project|sabhi project|saare project/.test(q)) {
    return "enumeration";
  }
  if (/compare|difference between|vs\.?|versus|farak/.test(q)) {
    return "comparison";
  }
  if (/summariz|summary of|overview of (his|her|their) experience/.test(q)) {
    return "summarization";
  }
  return "general_lookup";
}

module.exports = { classifyQuery };