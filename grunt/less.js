module.exports = {

  options: {
    paths: 'node_modules'
  },

  dist: {
    src: ['src/stylesheets/main.css'],
    dest: '<%= site %>/style.css'
  }

};
