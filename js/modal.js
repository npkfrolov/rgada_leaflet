/* Modal */

(function(){
    /* Open */
     $("[data-open-modal]").on("click", function(e){
        $("#"+$(this).data("open-modal")).fadeIn();
        e.preventDefault();
     });

     /* Hide */
     $("[data-close-modal]").on("click", function(e){
        $("#"+$(this).data("close-modal")).fadeOut();
        e.preventDefault();
     });
})();