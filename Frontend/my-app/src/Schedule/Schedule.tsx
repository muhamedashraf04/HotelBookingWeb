"use client";

import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";

type SchedulerProps = {
  resources: any[];
  events: any[];
  days: number;
  onEventClick: (args: any) => void;
  onEventRightClick: (args: any) => void;
};

export default function Scheduler({
  resources,
  events,
  days,
  onEventClick,
  onEventRightClick,
}: SchedulerProps) {
  return (
    <div className="flex justify-center mt-6">
      <div style={{ width: "1000px", height: `${resources.length * 40}px` }}>
        <DayPilotScheduler
          startDate={DayPilot.Date.today().addDays(-7)}
          days={days}
          scale="Day"
          timeHeaders={[{ groupBy: "Month" }, { groupBy: "Day", format: "d" }]}
          resources={resources}
          events={events}
          rowMarginBottom={20}
          onEventClick={onEventClick}
          onEventRightClick={onEventRightClick}
          eventMoveHandling="Disabled"
          eventResizeHandling="Disabled"
          theme="defaultschedule"
        />
      </div>
    </div>
  );
}
