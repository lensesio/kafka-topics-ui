angularAPP.controller('HomeCtrl', function ($log, toastFactory) {
  $log.info("Starting kafka-topics controller : home");
  toastFactory.hideToast();
});