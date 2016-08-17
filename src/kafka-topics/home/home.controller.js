angularAPP.controller('HomeCtrl', function ($log, toastFactory) {
  $log.debug("Starting HomeCtrl");
  toastFactory.hideToast();
});