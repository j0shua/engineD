//run from project root
var persist = require('../persist.js');

persist.save([{
      id: 'roomOne',
      comments: []
    },
    {
      id: 'roomTwo',
      comments: []
    },
    {
      id: 'roomThree',
      comments: []
    }
]);