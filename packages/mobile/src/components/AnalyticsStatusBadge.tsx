import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button, Chip } from "react-native-paper";

import { type DeliveryStatus } from "../stores/AnalyticsStore";
import { useStores } from "../stores/useStores";

const STATUS_ICON: Record<DeliveryStatus, string> = {
  pending: "clock-outline",
  sending: "upload",
  success: "check-circle-outline",
  failed: "alert-circle-outline",
};

/**
 * Surfaces the rolled-up analytics delivery status for the latest cart change.
 * When the latest delivery failed it offers a manual retry of that event.
 */
export const AnalyticsStatusBadge = observer(function AnalyticsStatusBadge() {
  const { t } = useTranslation();
  const { analytics } = useStores();
  const status = analytics.lastStatus;

  if (status === undefined) {
    return null;
  }

  const lastFailed = [...analytics.records]
    .reverse()
    .find((record) => record.status === "failed");

  return (
    <View style={styles.row}>
      <Chip icon={STATUS_ICON[status]} compact>
        {t(`analytics.${status}`)}
      </Chip>
      {status === "failed" && lastFailed !== undefined ? (
        <Button
          compact
          onPress={() => {
            analytics.retry(lastFailed.seq);
          }}
        >
          {t("analytics.retry")}
        </Button>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
});
