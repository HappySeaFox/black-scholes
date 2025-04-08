// Correct ranges automatically
//
$(document).ready(function() {
    $("input[type='number'][min][max]").on("blur", function() {
        const $input = $(this);
        const value = parseFloat($input.val());
        const min = parseFloat($input.attr("min"));
        const max = parseFloat($input.attr("max"));

        if (isNaN(value)) {
            $input.val(min);
        } else {
            if (value < min) {
                $input.val(min);
            } else if (value > max) {
                $input.val(max);
            }
        }
    });
});
