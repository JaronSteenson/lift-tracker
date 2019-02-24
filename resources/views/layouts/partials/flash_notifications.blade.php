@if (session()->has('success-alert'))
<div class="toast-wrapper row justify-content-center">
        <div role="alert" aria-live="assertive" aria-atomic="true" class="toast js-flash-notification"
             data-autohide="true" data-delay="2000" data-animation="true">
            <div class="toast-header">
                <strong class="mr-auto">Success</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                {{ session()->get('success-alert') }}
            </div>
        </div>
</div>
@endif