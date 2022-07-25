// scrolling on the page
    (function($){
        $(window).load(function(){
            $.mCustomScrollbar.defaults.scrollButtons.enable=true; //enable scrolling buttons by default
            $(".c_3_content").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".c_4_content").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );           
             $(".c_7_content").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".c_8_content").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".c_9_content").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".c_10_c_block").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".table_13").mCustomScrollbar(
                
                {
                    axis:"y",
                    theme:"rounded"
                    
                }

            );
             $(".c_15_content").mCustomScrollbar(
                
                {
                    axis:"x",
                    theme:"rounded"
                    
                }

            );                       

        });
    })(jQuery);

// Show text cell

                     function show_cell(id){
                        if($('#cell_'+id).is(':hidden')){
                          $('#cell_'+id).show();
                          $('#but_'+id).text("Свернуть");
                        }
                        else if($('#cell_'+id).is(':visible')){
                          $('#cell_'+id).hide();
                          $('#but_'+id).text("Развернуть");
                        }
                        
                      }
