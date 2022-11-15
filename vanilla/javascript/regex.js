const getMatches = (text, { start = "", end = "", between = "" }) => {
  const regex = new RegExp(`${start}(${between})${end}`, "g");
  const matches = [...text.match(regex)];

  return matches;
};

let string =
    "I expect ($-700) five hundred dollars ($500). and six hundred dollars ($600)",
  start,
  end,
  between = "\\S+";

// get all between parenthesis including parenthesis
start = "\\(";
end = "\\)";
console.debug(getMatches(string, { start, end, between }));

// get all between parenthesis excluding parenthesis
start = "\\$";
end = "\\d";
console.debug(getMatches(string, { start, end, between }));

// get all between parenthesis excluding negative values
start = "\\$";
end = "\\d";
between = "([^-][\\d]+)";
console.debug(getMatches(string, { start, end, between }));

// get all "hundred" string matches
start = "";
end = "";
between = "hundred";
console.debug(getMatches(string, { start, end, between }));
