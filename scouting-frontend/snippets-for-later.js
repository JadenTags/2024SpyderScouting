data() {
  return {
    userInput: '',
  }
},
methods: {
  debouncedValidate() {
    clearTimeout(this.debouncedTimer);
    this.debouncedTimer = setTimeout(() => {
      // Your validation logic goes here
      this.validateInput(this.userInput);
    }, 500); // Adjust delay (in milliseconds) as needed
  },
  validateInput(value) {
    // Implement your specific validation rules here
    if (value.length < 3) {
      this.errors = ['Input must be at least 3 characters long'];
    } else {
      this.errors = [];
    }
  }
}
