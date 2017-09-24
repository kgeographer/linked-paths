
module.exports = {

  options: {

    transform: [

      ['babelify', {
        // presets: ['stage-1']
        presets: ['es2015']
        // presets: ['latest']
      }],

      ['brfs']
    ],

    watch: true,

    browserifyOptions: {
      debug: true
    }

  },

  dist: {
    src: [
      'src/javascripts/graph.js','src/javascripts/histogram.js',
      'src/javascripts/map_tt.js','src/javascripts/periods.js',
      'src/javascripts/time.js','src/javascripts/tl-simple.js',
      'src/projects.json','src/javascripts/tl/*.js'
    ],
    dest: '<%= site %>/script.js'
  }

};
