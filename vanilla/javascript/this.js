const me = {
  name: "Ashutosh Verma",
  thisInArrow: () => {
    // no 'this' binding here
    console.log("My name is " + this.name);
  },
  thisInRegular() {
    // 'this' binding works here
    console.log("My name is " + this.name);
  },
};

me.thisInArrow();
me.thisInRegular();
