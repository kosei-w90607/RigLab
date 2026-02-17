class BackfillConfirmedAtForExistingUsers < ActiveRecord::Migration[7.1]
  def up
    User.where(confirmed_at: nil).update_all("confirmed_at = created_at")
  end

  def down
    # no-op: cannot distinguish originally-null from backfilled
  end
end
