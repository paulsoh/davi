d3.json('new_project_full_data.json', function(data) {
  data.forEach(function(d) {
    //console.log(d.rounded_money);
  });

  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { 
                return d.rounded_money; 
              });
  console.log(pie);
});
