

module.exports = {

  options: {
    paths: 'node_modules'
  },

  dist: {
    src: ['src/stylesheets/main.css'],
    // src: ['src/stylesheets/main.css','src/stylesheets/typeahead.css'],
    dest: '<%= site %>/style.css'
  }

};
