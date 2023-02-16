export enum TransferState {
  CONSTRAINED = "CONSTRAINED",

  /// This state represents a transfer that has been queued, but has not yet
  /// started
  /// <br>
  WAITING = "WAITING",

  /// This state represents a transfer that is currently uploading or
  /// downloading data
  IN_PROGRESS = "IN_PROGRESS",

  /// This state represents a transfer that is paused manual
  PAUSED = "PAUSED",

  /// This state represents a transfer that has been resumed and queued for
  /// execution, but has not started to actively transfer data.
  /// <br>
  RESUMED_WAITING = "RESUMED_WAITING",

  /// This state represents a transfer that is completed
  COMPLETED = "COMPLETED",

  /// This state represents a transfer that is canceled
  CANCELED = "CANCELED",

  /// This state represents a transfer that has failed
  FAILED = "FAILED",
  /// This is an internal value used to detect if the current transfer is in an
  /// unknown state
  UNKNOWN = "UNKNOWN"
}