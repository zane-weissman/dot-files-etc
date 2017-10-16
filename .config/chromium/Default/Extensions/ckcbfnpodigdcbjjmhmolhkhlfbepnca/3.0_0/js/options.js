$(document).ready(function() {
  $(':input').each(function() {
    var id = $(this).attr('id');
    if (localStorage[id] !== undefined) {
      $(this).val(localStorage[id]);
    }
  });
  
  $(".save").click(function() {
    $(':input').each(function() {
      var id = $(this).attr('id');
      localStorage[id] = $(this).val();
    });
  });
});

