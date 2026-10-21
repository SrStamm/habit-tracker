import { HabitType } from "@habits/shared/habit";
import { Tag } from "../../../components/ui/Tag";
import {
  HABIT_TYPE_BADGE_CLASSES,
  HABIT_TYPE_LABELS,
} from "../lib/habitTypeLabels";

type Props = {
  type: HabitType;
};

export function HabitTypeBadge({ type }: Props) {
  return (
    <Tag className={HABIT_TYPE_BADGE_CLASSES[type]}>
      {HABIT_TYPE_LABELS[type]}
    </Tag>
  );
}
