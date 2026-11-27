// src/i18n/en.ts
export const en = {
  "app.name": "FOODOO",
  "nav.currentStep": "Current step of the day",
  "today.menus.title": "Today's menus",
  "today.menus.available": "Available",
  "today.menus.left": "{qty} left over",
  "today.share.action": "Share list",
  "today.share.copied": "Cooking list copied",
  "today.share.failed": "Could not share the list. Please try again.",
  "week.leftoverCost": "Money lost on leftovers",
  "week.missedEarnings": "Margin missed by selling out",
  "week.moneyNote":
    "Worked out with your current prices and costs. Leftovers count at cost minus leftover value; missed margin is price minus cost.",
  "plan.cost": "Cooking cost {amount}",
  "plan.revenue": "If all sell {amount}",
  "close.progress": "{ready} of {total} menus ready",
  "service.progress": "{soldOut} of {total} menus sold out",
  "settings.jump": "Settings sections",
  "app.skip": "Skip to content",
  "app.loading": "Loading…",
  "app.offlineReady": "Ready to work offline.",
  "app.valueLine":
    "Daily portion planning that counts the customers a sold-out menu hides.",

  "nav.main": "Main navigation",
  "nav.today": "Today",
  "nav.plan": "Plan",
  "nav.service": "Sales",
  "nav.close": "Close",
  "nav.settings": "Settings",
  "nav.tutorial": "Tutorial",

  "header.demo": "Demo data",
  "header.demoSwitch": "Change demo",
  "header.demoTime": "Demo time",
  "header.offline": "Offline. Saved on this device.",

  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.next": "Next",
  "common.edit": "Edit",
  "common.archive": "Archive",
  "common.restore": "Restore",
  "common.closeDialog": "Close dialog",
  "common.yes": "Yes",
  "common.no": "No",
  "common.saveFailed": "Could not save. Please try again.",

  "lang.label": "Language",
  "lang.en": "English",
  "lang.id": "Bahasa Indonesia",

  "start.title": "Start using FOODOO",
  "start.lead": "Everything stays on this device. No account needed.",
  "welcome.start": "Start setup",
  "welcome.continue": "Continue setup",
  "demo.pick.title": "Choose a demo stall",
  "demo.pick.intro":
    "Choose a stall to open its demo and guided tutorial. Each stall uses practice data.",
  "demo.pick.hours": "Open {open}–{close}",
  "demo.pick.history": "{days} days of history",
  "demo.s1.desc":
    "Morning stall with two rush hours. Nasi Uduk sells out most days, so you can see how FOODOO counts the customers it missed.",
  "demo.s2.desc":
    "Office lunch stall with one noon rush. Busy on weekdays and quiet at weekends, so each weekday gets its own suggestion.",
  "demo.s3.desc":
    "Night stall open past midnight. Sales after 00:00 still count for the evening the stall opened.",
  "demo.s4.desc":
    "Stall that opened four days ago. There is not enough history yet, so suggestions start from the usual portions and adjust.",
  "tour.s1.exercise": "Track a sold-out dish",
  "tour.s2.exercise": "Compare weekday demand",
  "tour.s3.exercise": "Follow the overnight shift",
  "tour.s4.exercise": "Plan the first week",
  "tour.s1.closeTask":
    "Count the portions left for each dish still available. Close the day and save the counts to compare leftovers with missed sales.",
  "tour.s2.closeTask":
    "Enter the leftovers from lunch. If a holiday or unusual event affected sales, mark the day as unusual before closing and saving.",
  "tour.s3.closeTask":
    "Enter leftovers from this shift, including sales after midnight. Close and save the day under its opening date.",
  "tour.s4.closeTask":
    "Count the portions left, including any unsold {menu}. Close and save this day to add an observation for the next plan.",
  "demo.launch.practice": "Stall for practice",
  "tour.s1.task":
    "Compare {menu} with {menu2}. Look for the dish that often sells out before closing.",
  "tour.s2.task":
    "Read the reason for {menu}. Compare today’s suggestion with its usual portions before the lunch rush.",
  "tour.s3.task":
    "Check the opening date and the plan for {menu}. This shift runs from {open} until {close} the next morning.",
  "tour.s4.task":
    "Find the usual quantity for {menu}. Use + or − to try a starting quantity while the stall builds its history.",
  "demo.launch.stall": "Choose your stall",
  "demo.launch.moment": "Practice a stage independently",
  "demo.launch.note":
    "A moment sets a simulated demo time, shown next to the Demo data badge.",
  "demo.launch.realClock": "Open with the real clock",
  "demo.moment.plan.title": "Morning plan",
  "demo.moment.plan.desc": "Review the suggested portions and save a plan.",
  "demo.moment.service.title": "Selling",
  "demo.moment.service.desc": "Select a dish to record when it sells out.",
  "demo.moment.close.title": "Closing time",
  "demo.moment.close.desc": "Enter leftover portions, then close the day.",
  "demo.moment.summary.title": "Weekly summary",
  "demo.moment.summary.desc": "Open a day to review sales and leftovers.",
  "demo.refreshed": "Demo dates moved up to today",
  "welcome.demo": "Try demo stall",
  "welcome.demoNote":
    "Choose one of four demo stalls with made-up data to look around first.",
  "welcome.demoBlocked":
    "You have started your own setup. Delete it in Settings to try the demo.",

  "setup.step": "Step {step} of {total}",
  "setup.menus.title": "Your menus",
  "setup.menus.intro":
    "Add each dish you cook in the morning. You can change them later in Settings.",
  "setup.menus.needOne": "Add at least one menu to continue.",
  "setup.hours.title": "Opening hours",
  "setup.hours.intro": "When do you open and close, and which hours are busy?",
  "setup.done": "Setup complete. You are ready to plan.",
  "setup.hours.finish": "Finish setup",

  "menu.list.empty": "No menus yet. Add your first menu.",
  "menu.list.add": "Add menu",
  "menu.list.archived": "Archived menus ({count})",
  "menu.list.summary": "{price} · cost {cost} · usual {qty} portions",
  "menu.list.editLabel": "Edit {name}",
  "menu.list.archiveLabel": "Archive {name}",
  "menu.list.restoreLabel": "Restore {name}",
  "menu.editor.addTitle": "Add menu",
  "menu.editor.editTitle": "Edit menu",
  "menu.field.name": "Menu name",
  "menu.field.price": "Selling price (Rp)",
  "menu.field.cost": "Cost per portion (Rp)",
  "menu.field.salvage": "Value of a leftover portion (Rp)",
  "menu.field.salvageHint":
    "What an unsold portion is still worth to you, for example as a staff meal. Usually 0.",
  "menu.field.usualQty": "Usual portions per day",
  "menu.error.nameLength": "Enter a name of 1 to 40 characters",
  "menu.error.priceInvalid": "Enter a price in whole rupiah, above 0",
  "menu.error.costInvalid": "Enter a cost in whole rupiah, 0 or more",
  "menu.error.costNotBelowPrice": "Cost must be lower than price",
  "menu.error.salvageInvalid": "Enter a value in whole rupiah, 0 or more",
  "menu.error.salvageNotBelowPrice": "Leftover value must be lower than price",
  "menu.error.usualInvalid": "Enter a whole number from 1 to 999",
  "menu.saved": "Menu saved",
  "menu.archivedToast": "Menu archived",
  "menu.restoredToast": "Menu restored",

  "hours.open": "Opening time",
  "hours.close": "Closing time",
  "hours.error.timeInvalid": "Enter a time as HH:MM",
  "hours.error.closeSameAsOpen":
    "Closing time must be different from opening time",
  "hours.overnight":
    "You close after midnight. Sales after midnight count for the day you opened.",
  "hours.busyTitle": "Busy hours",
  "hours.busyHint":
    "Tap an hour to change it: quiet, normal, busy. Busier hours mean more customers arrive then.",
  "hours.busyEmpty": "Set valid opening hours to see the busy hours.",
  "hours.level.1": "Quiet",
  "hours.level.2": "Normal",
  "hours.level.4": "Busy",
  "hours.saved": "Hours saved",

  "today.title": "Today",
  "today.loopTitle": "Today's loop",
  "today.phase.plan": "Plan",
  "today.phase.service": "Service",
  "today.phase.close": "Close",
  "today.status.done": "Done",
  "today.status.current": "Now",
  "today.status.next": "Next",
  "today.action.plan": "Plan today's portions",
  "today.action.service": "Open service",
  "today.action.close": "Close the day",
  "today.action.done": "See you tomorrow",
  "today.doneNote": "Today is closed. Come back tomorrow morning to plan.",
  "today.counts.title": "Today so far",
  "today.counts.portions": "Portions planned",
  "today.counts.soldOut": "Menus sold out",
  "today.counts.closed": "Day closed",
  "today.empty.setupTitle": "Finish setting up",
  "today.empty.setupBody":
    "Add your menus and opening hours to get daily suggestions.",
  "today.empty.setupAction": "Continue setup",
  "today.empty.menusTitle": "No active menus",
  "today.empty.menusBody":
    "All menus are archived. Add or restore a menu in Settings.",
  "today.empty.menusAction": "Open Settings",
  "today.incompleteTitle": "Days not closed",
  "today.incompleteBody":
    "These days were never closed, so they are not used for suggestions yet. Close them to count them:",
  "today.incompleteAction": "Close {date}",
  "week.title": "Last 7 days",
  "week.empty":
    "No closed days in the last 7 days yet. Close a day to see your numbers.",
  "week.leftover": "Leftover portions",
  "week.sellOuts": "Sell-outs",
  "week.lostSales": "Lost sales (portions)",
  "week.accepted": "Plans accepted as suggested",
  "week.percent": "{value}%",
  "nav.history": "History",
  "today.historyLink": "See history",
  "history.title": "History",
  "history.menus.title": "Per menu, last 7 days",
  "history.col.menu": "Menu",
  "history.col.date": "Date",
  "history.col.cooked": "Cooked",
  "history.col.sold": "Sold",
  "history.col.leftover": "Leftover",
  "history.col.demand": "Demand",
  "history.chart.title": "Cooked vs demand",
  "history.chart.menu": "Menu",
  "history.chart.caption": "Cooked and demand per day for {menu}, last 7 days",
  "history.chart.cooked": "Cooked",
  "history.chart.demand": "Demand",
  "history.chart.estimate": "Demand (estimate, sold-out day)",
  "history.days.title": "Past days",
  "history.days.empty": "No days recorded yet.",
  "history.days.meta": "{portions} portions · {soldOut} sold out",
  "history.days.more": "Show more days",
  "history.status.open": "Not closed",
  "history.status.closed": "Closed",
  "history.status.unusual": "Unusual day",
  "estimate.tag": "estimate",
  "history.menus.note":
    "Totals of closed, usual days. Demand on sold-out days is an estimate.",
  "day.title": "Day details",
  "day.noSuggestion": "No suggestion stored",
  "day.back": "Back to history",
  "day.empty": "Nothing was recorded on this day.",
  "day.closeAction": "Close this day",
  "day.suggested": "Suggested {qty}",
  "day.soldOutAt": "Sold out {time}",
  "day.notSoldOut": "Not sold out",
  "transfer.export.title": "Export your data",
  "transfer.format": "File format",
  "transfer.format.json": "JSON",
  "transfer.format.csv": "CSV",
  "transfer.format.xlsx": "XLSX",
  "transfer.hint.json":
    "Full backup of your stall, menus, every day and register sales. Use it to move to a new phone.",
  "transfer.hint.csv":
    "Daily records per menu, one row each. Opens in any spreadsheet app.",
  "transfer.hint.xlsx":
    "Full backup for Excel or Google Sheets, in five sheets: Stall, Menus, Days, MenuDays, Sales.",
  "transfer.export.action": "Export file",
  "transfer.exported": "File saved",
  "transfer.exportFailed": "Could not export. Please try again.",
  "transfer.import.title": "Import a file",
  "transfer.import.hint":
    "JSON or XLSX restores a full backup and replaces the data on this device. CSV adds or updates daily records for the menus you already have.",
  "transfer.import.action": "Choose a file to import",
  "transfer.import.file": "File to import",
  "transfer.imported": "Data imported",
  "transfer.issues.title":
    "Nothing was imported. Fix these problems in the file and try again:",
  "transfer.issue.unreadable": "The file could not be read ({where}).",
  "transfer.issue.wrongFormat": "This is not a FOODOO file.",
  "transfer.issue.unknownVersion":
    "This file comes from a newer or unknown version of FOODOO.",
  "transfer.issue.missingSheet": "The sheet {where} is missing.",
  "transfer.issue.missingColumn": "The column {where} is missing.",
  "transfer.issue.badValue": "The value at {where} is not valid.",
  "transfer.issue.unknownMenu":
    "The menu at {where} does not exist on this device.",
  "transfer.issue.duplicate": "{where} appears twice.",
  "transfer.issue.noStall": "Set up your stall first, then import a CSV file.",
  "transfer.issue.empty": "The file has no data ({where}).",
  "transfer.confirm.title": "Import this file?",
  "transfer.confirm.replace":
    "This replaces all data on this device with the file: {menus} menus and {days} days.",
  "transfer.confirm.merge":
    "This adds or updates {days} days of records for your menus. Other data stays as it is.",
  "transfer.confirm.action": "Import",
  "transfer.manage.title": "Manage data",

  "plan.title": "Plan",
  "plan.intro": "Suggested portions for today. Change any number, then save.",
  "plan.suggested": "Suggested {qty}",
  "plan.edited": "Edited",
  "plan.portionsLabel": "Portions of {name}",
  "plan.decrease": "One less {name}",
  "plan.increase": "One more {name}",
  "plan.total": "Total {qty} portions",
  "plan.acceptAll": "Accept all",
  "plan.save": "Save plan",
  "plan.saved": "Plan saved",
  "plan.savedNote":
    "Plan saved. You can still change it until the first menu sells out.",
  "plan.locked":
    "The plan is locked because a menu has sold out today. Undo the sell-out to change it.",
  "plan.closedNote": "Today is closed. This was the plan.",
  "plan.cooked": "Cooked {qty}",

  "service.title": "Service",
  "service.intro": "Tap a menu the moment it sells out.",
  "service.cooked": "Cooked {qty}",
  "service.tapHint": "Tap when sold out",
  "service.soldOutAt": "Sold out {time}",
  "service.holdHint": "Hold the tile or press Edit time to change the time.",
  "service.earlyTitle": "{name} sold out already?",
  "service.earlyBody":
    "It is {time} and you opened at {open}. A sell-out this early makes FOODOO estimate very high demand. Mark it only if it really sold out.",
  "service.earlyConfirm": "Yes, it sold out",
  "service.editTime": "Edit time",
  "service.editTimeLabel": "Edit the sold-out time of {name}",
  "service.soldOutToast": "{name} sold out at {time}",
  "service.undo": "Undo",
  "service.undone": "Sell-out undone",
  "service.timeSaved": "Sold-out time saved",
  "service.cleared": "Marked as not sold out",
  "service.notPlannedTitle": "Plan today first",
  "service.notPlannedBody": "Service starts once today's portions are saved.",
  "service.planAction": "Plan today's portions",
  "service.closedNote": "Today is closed. Sell-outs can no longer be changed.",

  "soldOut.sheetTitle": "Sold-out time: {name}",
  "soldOut.timeLabel": "Time it sold out",
  "soldOut.clear": "Not sold out",
  "soldOut.error.timeInvalid": "Enter a time as HH:MM",
  "soldOut.error.outsideHours": "Enter a time between {open} and {close}",

  "close.title": "Close",
  "close.intro": "Count what is left of each menu.",
  "close.leftoverPlaceholder": "?",
  "close.leftoverMissing": "Enter the leftover portions, or 0 if none are left",
  "close.leftoverMissingSummary":
    "Enter the leftover portions for {count} menu(s) before closing.",
  "close.pastIntro": "You are closing a past day: {date}.",
  "close.pastSheetTitle": "Close {date}?",
  "close.pastClosed": "{date} closed",
  "close.soldOutChip": "Sold out {time}",
  "close.leftoverLabel": "Leftover portions of {name}",
  "close.cookedOf": "Cooked {qty}",
  "close.missedQuestion": "About what time did {name} run out?",
  "close.missedHint":
    "Nothing is left, but no sell-out was tapped. If you are not sure, keep the closing time.",
  "close.unusual": "Unusual day",
  "close.unusualHint":
    "Rain, a holiday or an event. The day is kept but not used for suggestions.",
  "close.closeDay": "Close day",
  "close.sheetTitle": "Close today?",
  "close.todayHeading": "How many wanted each menu today",
  "close.tomorrowNone": "No active menus. Add or restore a menu in Settings.",
  "close.tomorrowHeading": "Tomorrow's suggestions, {date}",
  "close.wanted": "Wanted",
  "close.suggestedPortions": "suggested portions",
  "close.confirm": "Save all",
  "close.closed": "Day closed",
  "close.closedTitle": "Today is closed",
  "close.unusualNote":
    "Marked as an unusual day: kept, but not used for suggestions.",
  "close.tomorrowNote":
    "Tomorrow morning the Plan screen starts from these numbers.",
  "close.notPlannedTitle": "Nothing to close yet",
  "close.notPlannedBody": "Plan today's portions first.",

  "estimate.value": "≈ {qty} (estimate)",
  "estimate.none": "Not recorded",

  "settings.title": "Settings",
  "settings.stall.title": "Stall",
  "settings.stall.name": "Stall name (optional)",
  "settings.stall.nameError": "Use at most 40 characters",
  "settings.stall.nameSaved": "Stall name saved",
  "settings.menus.title": "Menus",
  "settings.hours.title": "Hours and busy hours",
  "settings.hours.save": "Save hours",
  "settings.language.title": "Language",
  "settings.data.title": "Data",
  "settings.data.onDevice":
    "Everything is stored only on this device. Nothing leaves it unless you share or export it.",
  "settings.data.loadDemo": "Load demo stall",
  "settings.data.resetDemo": "Reset demo data",
  "settings.data.switchDemo": "Choose another demo stall",
  "settings.data.loadDemoBlocked":
    "Delete your own data first to load the demo stall.",
  "settings.data.demoLoaded": "Demo stall loaded",
  "settings.data.removeDemo": "Remove demo stall",
  "settings.data.deleteAll": "Delete all data",
  "settings.delete.title": "Delete all data?",
  "settings.delete.body":
    "This removes every menu, plan and record from this device. It cannot be undone.",
  "settings.delete.confirm": "Delete everything",
  "settings.removeDemo.title": "Remove the demo stall?",
  "settings.removeDemo.body":
    "This removes all demo data. You can then set up your own stall.",
  "settings.removeDemo.confirm": "Remove demo",
  "settings.about.title": "About",
  "settings.about.version": "Version {version}",
  "settings.about.body":
    "FOODOO suggests portions with fixed, explainable rules. It uses no AI model. The licences of the libraries and fonts are listed in the project README.",
  "settings.about.link": "Open the project README",

  "register.title": "Register",
  "register.intro": "Tap a menu to add a portion to the cart.",
  "register.left": "{qty} left",
  "register.over": "{qty} over plan",
  "register.stockLabel": "Stock of {name}: {left} of {total} left",
  "register.soldOutButton": "Sold out",
  "register.soldOutLabel": "Mark {name} as sold out",
  "register.cartButton": "Cart: {count} items, {total}",
  "register.cartTitle": "Cart",
  "register.emptyCart": "The cart is empty.",
  "register.clear": "Clear cart",
  "register.total": "Total",
  "register.method": "Payment (label only)",
  "register.cash": "Cash",
  "register.qris": "QRIS",
  "register.methodNote":
    "FOODOO records the method only. It does not process payments.",
  "register.tendered": "Cash received",
  "register.exact": "Exact",
  "register.change": "Change: {amount}",
  "register.short": "Short by {amount}",
  "register.save": "Save sale",
  "register.saved": "Sale saved: {total}",
  "register.autoSoldOut": "{name} sold out at {time}",
  "register.saveFailed": "The sale was not saved. Nothing was recorded.",
  "register.todayTitle": "Today's sales",
  "register.revenue": "Revenue",
  "register.count": "Transactions",
  "register.noSales": "No sales yet today.",
  "register.line": "{qty} × {name}",
  "register.methodCash": "Cash",
  "register.methodQris": "QRIS",
  "register.void": "Void last sale",
  "register.voidTitle": "Void the last sale?",
  "register.voidBody":
    "The sale from {time} ({total}) is removed. Sold-out marks set by the register are removed if stock returns.",
  "register.voidConfirm": "Void sale",
  "register.voided": "Sale voided",
  "register.voidedReopened": "Sale voided. {name} is available again.",
  "register.dayChanged": "The day changed. The cart was cleared.",

  "settings.mode.title": "Sales mode",
  "settings.mode.simple": "Simple",
  "settings.mode.simpleHint":
    "Tap Sold out when a menu runs out. No sales are recorded.",
  "settings.mode.pos": "Register",
  "settings.mode.posHint":
    "Record each sale. Remaining portions and sell-out times update by themselves.",
  "settings.mode.keep":
    "You can switch at any time. Recorded sales are never deleted by switching.",
  "settings.mode.saved": "Mode saved",

  "close.posNote":
    "Register says {remaining} left. You entered {entered} (difference {gap}).",
  "close.posOver": "The register recorded {qty} portions over the plan.",
  "close.unknownTime": "Don't remember",
  "close.unknownTimeNote": "Counted as sold out at closing time.",
  "close.knownTime": "Enter a time",
  "close.someLeft": "Some left over",
  "close.cancelledNote": "Sell-out mark removed. Enter what is left.",
  "close.didSellOut": "It did sell out",
  "close.revenue": "Revenue: {amount}",
  "close.correct": "Correct this day",
  "close.correctNote": "You can correct this day until {date}.",
  "close.corrected": "Day corrected",

  "reason.history.soldOutWeekday":
    "Sold out on {soldOut} of the last {observations} {weekdayPlural} → {delta}",
  "reason.history.soldOutRecent":
    "Sold out on {soldOut} of the last {observations} days → {delta}",
  "reason.history.leftover":
    "Leftovers on {leftover} of the last {observations} days → {delta}",
  "reason.history.base": "Based on the last {observations} days",
  "reason.coldStart":
    "Not enough history yet. Starting from your usual {usualQty}",
  "reason.coldStartUp":
    "Not enough history yet. Starting from your usual {usualQty}, sold out last time → {delta}",
  "reason.coldStartDown":
    "Not enough history yet. Starting from your usual {usualQty}, leftovers last time → {delta}",

  "weekday.plural.0": "Sundays",
  "weekday.plural.1": "Mondays",
  "weekday.plural.2": "Tuesdays",
  "weekday.plural.3": "Wednesdays",
  "weekday.plural.4": "Thursdays",
  "weekday.plural.5": "Fridays",
  "weekday.plural.6": "Saturdays",
  "how.title": "How FOODOO calculates",
  "how.intro":
    "FOODOO uses a few fixed rules. This page shows them on an example, worked out by the same code the app uses for your stall.",
  "how.exampleNote":
    "Example stall. These numbers are an example, not your data.",
  "how.demandTitle": "3. How many people wanted a menu that sold out",
  "how.demandSetup":
    "Example: Nasi Uduk. {cooked} portions were cooked, and the last one was sold at {time}.",
  "how.barBefore": "(before {time})",
  "how.barsCaption":
    "Busy hours of the example stall. Filled bars are the hours before {time}.",
  "how.demandShare":
    "From the busy hours, about {percent}% of a normal day's customers had arrived by {time}.",
  "how.demandResult":
    "So {cooked} portions were enough for only about {percent}% of the day's customers. Over the whole day, about this many people would have wanted it:",
  "how.ruleCounted":
    "If a menu did not sell out, nothing is guessed: wanted = cooked − leftover.",
  "how.ruleLate":
    "If it sold out at or very close to closing time, wanted = cooked.",
  "how.ruleCap":
    "The guess is never more than 3 times what was cooked ({cap} here).",
  "how.ruleBusy":
    "A busy hour counts 4 times, a normal hour 2 times and a quiet hour once. You set them in Settings.",
  "how.suggestTitle": "4. How tomorrow's portions are suggested",
  "how.suggestMoney":
    "Each extra portion sold earns {gain}. Each portion left over loses {loss}, what it cost to cook.",
  "how.suggestCover":
    "Here a leftover loses more than a sale earns, so FOODOO does not cook for the busiest day. It picks the amount that would have been enough on about {cover} of every 100 past days.",
  "how.suggestHistory":
    "On the last {count} {weekdays}, people wanted: {values}.",
  "how.ruleEligible":
    "Only closed, normal days count. Unusual days and days not closed are left out.",
  "how.ruleWeekday":
    "It looks at the same weekday first (up to the last 8). With fewer than 5 of those, it uses the last 14 days.",
  "how.ruleColdStart":
    "With fewer than 5 days of history, it starts from your usual portions: 10% more after a sell-out, 10% less when more than a fifth was left over.",
  "how.ruleYouDecide":
    "A suggestion is only a starting point. You can change every number before cooking.",
  "how.notTitle": "What FOODOO does not do",
  "how.notAi":
    "It uses no AI model. Every number comes from the fixed rules on this page.",
  "how.notCloud":
    "It sends nothing on its own. Your data stays on this device unless you share or export it.",
  "how.back": "Back to the app",
  "how.nav.label": "Steps on this page",
  "how.nav.inputs": "What you enter",
  "how.nav.sources": "Where numbers come from",
  "how.nav.demand": "Hidden demand",
  "how.nav.suggest": "Suggested portions",
  "how.nav.result": "What you see",
  "how.nav.accuracy": "Accuracy",
  "how.inputsTitle": "1. What you tell FOODOO",
  "how.inputsLead":
    "FOODOO has no food database and no nutrition figures. It starts from what you enter about your own stall.",
  "how.input.menusTitle": "Menus",
  "how.input.menusBody":
    "Name, selling price, cost to cook and usual portions. Set once, change any time.",
  "how.input.hoursTitle": "Busy hours",
  "how.input.hoursBody": "Mark each opening hour as quiet, normal or busy.",
  "how.input.nightTitle": "Each day",
  "how.input.nightBody":
    "Tap Sold out during service, or ring up sales in Register mode. At night, enter the leftovers.",
  "how.input.unusualTitle": "Unusual days",
  "how.input.unusualBody":
    "Mark a rainy day or a holiday as unusual so it does not shape later suggestions.",
  "how.sourcesTitle": "2. Where each number comes from",
  "how.sourcesLead":
    "Nothing comes from outside your phone. Each number is either typed by you or worked out by a fixed rule.",
  "how.sources.col.number": "Number",
  "how.sources.col.from": "Comes from",
  "how.sources.col.kind": "Kind",
  "how.kind.entered": "You entered",
  "how.kind.calculated": "Calculated",
  "how.source.cooked": "Portions cooked",
  "how.source.cookedFrom":
    "The morning plan: suggested first, then edited by you.",
  "how.source.soldOut": "Sold-out time",
  "how.source.soldOutFrom":
    "Your tap in Service, or the last sale in Register mode.",
  "how.source.leftover": "Leftover portions",
  "how.source.leftoverFrom": "You, when you close the day.",
  "how.source.demand": "People who wanted a menu",
  "how.source.demandFrom":
    "Cooked minus leftover. If the menu sold out, an estimate from the busy hours.",
  "how.source.suggestion": "Suggested portions",
  "how.source.suggestionFrom": "Past demand, with your price and cost.",
  "how.source.money": "Money figures",
  "how.source.moneyFrom": "Your prices and costs as they are today.",
  "how.demandTry": "Move the sold-out time and watch the estimate change.",
  "how.demandSlider": "Sold out at",
  "how.ruleNow.scaled":
    "Rule in use: the busy hours scale the {cooked} sold portions up to a whole day.",
  "how.ruleNow.late":
    "Rule in use: it sold out at closing time, so wanted = cooked ({cooked}).",
  "how.ruleNow.capped":
    "Rule in use: the cap. Almost nobody had arrived yet, so the guess stops at {cap}.",
  "how.suggestTry":
    "Change what one portion costs to cook and see how the suggestion moves.",
  "how.costSlider": "Cost to cook one portion",
  "how.suggestPrice": "Selling price in the example: {price}.",
  "how.resultTitle": "5. What you see in the app",
  "how.resultBody":
    "On the Plan screen, each menu card shows the suggested portions with a one-line reason, like the one in step 4.",
  "how.resultMore":
    "The reason says how many past days were used, how many of them sold out or had leftovers, and how the number compares with last time.",
  "how.resultLoop":
    "After you cook and close the day, the real numbers go back into step 3 and tomorrow's suggestion is worked out again.",
  "how.accuracyTitle": "6. How accurate is this?",
  "how.accuracyLead":
    "FOODOO states no accuracy percentage. It has not been tested with real stalls. The rules were tried only on simulated stalls, and those results describe the simulation, not your warung.",
  "how.affectTitle": "What makes it less accurate",
  "how.affect1":
    "Fewer than 5 days of history: the suggestion is only a starting point.",
  "how.affect2":
    "A missed or guessed sell-out time: the demand is then an estimate.",
  "how.affect3": "Unusual days that were not marked.",
  "how.affect4": "Busy hours that do not match your real day.",
  "how.affect5":
    "Changed prices or costs: money figures use today's values, also for past days.",
  "how.improveTitle": "What you can do",
  "how.improve1": "Enter the leftovers every night.",
  "how.improve2": "Confirm the sell-out time when you can.",
  "how.improve3": "Mark unusual days.",
  "how.improve4": "Adjust the busy hours in Settings.",
  "check.title": "Suggestions against what happened",
  "check.lead":
    "For each closed normal day with a suggestion made from history, FOODOO compares the suggestion with how many people wanted that menu. Only the last 28 days are used.",
  "check.empty":
    "Not enough days yet: {count} of {min} days checked. The check appears once {min} days with a suggestion made from history have been closed.",
  "check.days": "Days checked",
  "check.error": "Average miss",
  "check.errorValue": "{value} portions",
  "check.covered": "Suggestion was enough",
  "check.coveredValue": "{value}% of days",
  "check.target":
    "Aim: {value}% of days. Your price and cost set this aim, because FOODOO does not try to cover every day.",
  "check.overUnder":
    "Above what people wanted on {over} days, below on {under} days.",
  "check.estimateNote":
    "On sold-out days, how many people wanted the menu is itself an estimate.",
  "check.scopeNote":
    "This checks your own records. It is not a promise about tomorrow.",
  "close.howLink": "How is this worked out?",
  "settings.about.how": "How FOODOO calculates",
  "settings.data.storageKept":
    "Protected: the browser will not clear this data to free up space.",
  "settings.data.storageAtRisk":
    "Not protected yet: the browser may clear this data if the phone runs low on space.",
  "settings.data.storageUnknown":
    "This browser does not say whether it protects the data.",
  "settings.data.keep": "Keep my data",
  "settings.data.keepGranted": "The browser will keep your data",
  "settings.data.keepRefused":
    "The browser said no for now. Adding FOODOO to the home screen often helps.",
  "landing.pillOffline": "Works offline",
  "landing.pillNoAccount": "No account",
  "landing.pillLocal": "Data stays on your phone",
  "landing.problemTitle": "Every morning is a guess",
  "landing.problemWasteTitle": "Too much",
  "landing.problemWasteBody":
    "Unsold portions go to waste, and so does the money spent cooking them.",
  "landing.problemEarlyTitle": "Too little",
  "landing.problemEarlyBody":
    "A dish sells out before noon and later customers walk away.",
  "landing.problemHiddenTitle": "Sold out hides demand",
  "landing.problemHiddenBody":
    "Sales stop when the pot is empty, so your records never show how many people really wanted it.",
  "landing.loopTitle": "A daily loop that takes minutes",
  "landing.loopPlanTitle": "Plan in the morning",
  "landing.loopPlanBody":
    "See a suggested portion for each dish, then change any number you like.",
  "landing.loopServiceTitle": "Mark sold-out times",
  "landing.loopServiceBody": "Tap when a dish runs out. FOODOO keeps the time.",
  "landing.loopCloseTitle": "Close the day",
  "landing.loopCloseBody":
    "Enter what is left. FOODOO estimates how many people wanted each dish.",
  "landing.loopNextTitle": "Better tomorrow",
  "landing.loopNextBody":
    "Tomorrow's suggestion learns from today, including the customers you missed.",
  "landing.exampleBadge": "Example",
  "landing.whyTitle": "Why FOODOO is different",
  "landing.whyHiddenTitle": "Counts missed customers",
  "landing.whyHiddenBody":
    "It uses the sell-out time and your busy hours to estimate the demand a sold-out day hides.",
  "landing.whyRulesTitle": "Rules you can check",
  "landing.whyRulesBody":
    "No AI model. Every number comes from fixed rules you can read in the app.",
  "landing.whyOfflineTitle": "Built for the stall",
  "landing.whyOfflineBody":
    "Installs like an app and works with no signal, on an ordinary phone.",
  "landing.whyPrivateTitle": "Private by design",
  "landing.whyPrivateBody":
    "No login, no server, no customer data. Export or delete everything at any time.",
  "landing.closingTitle": "Ready to try it?",
  "landing.closingBody":
    "Set up your own menus on this phone. No account needed.",
  "landing.installHint":
    "Tip: use your browser's “Add to Home screen” to open FOODOO like an app.",
  "settings.about.landing": "About FOODOO",
  "landing.headline": "Cook the right amount.",
  "landing.headlineAccent": "No piles of leftovers, no turning customers away.",
  "landing.exampleTitle": "What you will see",
  "landing.exampleCooked": "Cooked",
  "landing.exampleSoldOut": "Sold out at",
  "landing.pageTitle": "Daily portion planning",
  "landing.eyebrow": "For warung and small food stalls",
  "landing.nav.label": "Page sections",
  "landing.nav.menu": "Menu",
  "landing.nav.problem": "The problem",
  "landing.nav.loop": "How it works",
  "landing.nav.ecosystem": "Ecosystem",
  "landing.nav.trust": "Trust",
  "landing.eco.title": "One loop, five connected parts",
  "landing.eco.lead":
    "FOODOO is for owners of warung and small food stalls who decide portions by feel. No part stands alone: what you record in one becomes the input of the next.",
  "landing.eco.passes": "Passes on:",
  "landing.eco.setupTitle": "Setup",
  "landing.eco.setupBody": "Menus, prices, costs and busy hours, entered once.",
  "landing.eco.setupOut":
    "the numbers every suggestion and estimate is built on.",
  "landing.eco.planTitle": "Plan",
  "landing.eco.planBody": "Suggests portions for each menu, with a reason.",
  "landing.eco.planOut": "the portions you cook, after your edits.",
  "landing.eco.serviceTitle": "Service and Register",
  "landing.eco.serviceBody":
    "One tap when a menu sells out, or sales rung up in Register mode.",
  "landing.eco.serviceOut": "the time customers could no longer be served.",
  "landing.eco.closeTitle": "Close",
  "landing.eco.closeBody": "Leftovers, and the sell-out time if it was missed.",
  "landing.eco.closeOut":
    "how many people wanted each menu, counted or estimated.",
  "landing.eco.historyTitle": "History",
  "landing.eco.historyBody":
    "Past days, the weekly summary and a check of suggestions against what happened.",
  "landing.eco.historyOut": "closed normal days that shape tomorrow's plan.",
  "landing.eco.loop":
    "Then the loop starts again with a better-informed morning plan.",
  "landing.trust.title": "What FOODOO claims, and what it does not",
  "landing.trust.lead":
    "A stall owner needs numbers that can be checked. These are the limits.",
  "landing.trust.estimateTitle": "Estimates are labelled",
  "landing.trust.estimateBody":
    "When a menu sold out, how many people wanted it is a guess from your busy hours. It always carries the word estimate.",
  "landing.trust.simulatedTitle": "Tested on simulated stalls only",
  "landing.trust.simulatedBody":
    "The backtest and the demo stalls use made-up data. FOODOO has not been tested with real stall owners, so it states no accuracy percentage.",
  "landing.trust.yoursTitle": "Suggestions are starting points",
  "landing.trust.yoursBody":
    "You change every number before cooking. FOODOO does not promise more profit or fewer leftovers for your stall.",
  "landing.trust.rulesTitle": "No hidden model",
  "landing.trust.rulesBody":
    "No AI model and no server. The same fixed rules are walked through, step by step, on the page below.",
  "landing.nav.team": "Team",
  "landing.nav.openApp": "Open the app",
  "landing.cta.launch": "Launch Demo App",
  "landing.cta.continue": "Continue to the app",
  "landing.cta.setup": "Set up my own stall",
  "landing.cta.note":
    "Choose a stall to start its tutorial. Practice data stays on this device.",
  "landing.try.eyebrow": "Try it now",
  "landing.try.title": "Explore the interactive demo",
  "landing.try.lead":
    "Explore how four stalls plan portions, record sales and count leftovers at closing time.",
  "landing.try.openTitle": "Four stalls to choose from",
  "landing.try.openBody":
    "A busy morning stall, an office lunch stall, a night stall and a brand-new one, each with made-up history on this device.",
  "landing.try.tourTitle": "A tutorial and a guided case",
  "landing.try.tourBody":
    "Seven short steps through one day, or a case that explains what happens in that stall and why. Stop or replay any time.",
  "landing.try.freeTitle": "Then explore freely",
  "landing.try.freeBody":
    "Change numbers, mark sell-outs, close the day, or switch to another demo stall.",
  "landing.problemLead":
    "Cook too much and money is wasted. Cook too little and customers leave, and the records never show how many.",
  "landing.loopLead": "Four small moments a day, each only a few taps.",
  "landing.seeEyebrow": "From pot to plan",
  "landing.seeLead":
    "One sold-out dish, followed from service to the next morning. The numbers are an example, worked out by the app's own rules.",
  "landing.preview.service": "One tap the moment the pot is empty.",
  "landing.preview.close":
    "At night FOODOO estimates how many people wanted it.",
  "landing.preview.next":
    "Later suggestions learn from this estimate, not only the {cooked} portions you sold.",
  "landing.whyEyebrow": "What sets it apart",
  "landing.explorer.title": "When did it sell out?",
  "landing.explorer.cooked": "{cooked} portions cooked",
  "landing.explorer.legendSold": "Customers before the sell-out",
  "landing.explorer.legendMissed": "Customers after: missing from sales",
  "landing.explorer.arrived": "Customers arrived by then",
  "landing.explorer.hint":
    "Drag the slider. Same rules as the app, on an example stall.",
  "landing.teamTitle": "The team behind FOODOO",
  "landing.teamBody":
    "Calon Mantu Idaman, building for STACK 2026 by GDGoC ITB, Case 2: Stronger Communities and Everyday Services.",
  "landing.team.domain": "Demand estimates, suggestions and backtest",
  "landing.team.data": "On-device data, export and import",
  "landing.team.screens": "Screens and components",
  "landing.team.platform":
    "Offline app, languages, accessibility, tests and deployment",
  "landing.footerNote": "What you enter stays on your device.",
  "landing.footerLinks": "More about FOODOO",
  "today.hint.plan":
    "Check each suggested number, change what you like, then save.",
  "today.hint.service": "When a menu runs out, tap it so the time is kept.",
  "today.hint.close":
    "Count what is left so later suggestions can learn from today.",
  "tour.label": "Tutorial",
  "tour.back": "Back",
  "tour.close": "Close tutorial",
  "tour.skipAll": "Skip tutorial",
  "tour.tryIt": "Press the highlighted item to continue.",
  "tour.card.title": "Walk through a full day",
  "tour.card.body":
    "Seven short steps through one full day: plan, sell, close and review.",
  "tour.caseLabel": "What happens in this stall",
  "tour.progress": "Step {step} of {total}",
  "tour.next": "Next",
  "tour.finish": "Finish",
  "tour.goThere": "Take me there",
  "tour.replay": "Replay tutorial",
  "tour.start": "Start tutorial",
  "tour.notNow": "Not now",
  "tour.register": "Try the register",
  "tour.sim": "Try the simulation",
  "tour.intro.title": "One day in 7 steps",
  "tour.intro.body":
    "Plan, sell, close, then see the result. The demo restarts at the morning, and its data is made up. Each step also explains what happens in this stall.",
  "tour.suggestion.title": "A suggestion with a reason",
  "tour.suggestion.body":
    "Each card shows how many portions to cook and why. Change a number with + and −.",
  "tour.accept.title": "Save the plan",
  "tour.accept.body": "Press Accept all to save today's portions.",
  "tour.toService.title": "Open selling",
  "tour.toService.body": "Press Sales in the menu.",
  "tour.soldOut.title": "A menu runs out",
  "tour.soldOut.body":
    "Tap a menu to record when it sold out. Undo stays for 10 seconds.",
  "tour.toClose.title": "Close the day",
  "tour.toClose.body": "Press Close in the menu.",
  "tour.close.title": "Count what is left",
  "tour.close.body":
    "Enter what is left of each menu, press Close day, then Save all.",
  "tour.toHistory.title": "See the result",
  "tour.toHistory.body":
    "Press History to see leftovers, sell-outs and estimated lost sales.",
  "tour.outro.title": "That is the daily loop",
  "tour.outro.body":
    "Tomorrow's suggestions have already learned from today. You can also try these two.",
  "sim.title": "Hourly simulation",
  "sim.cardBody":
    "Watch simulated customers arrive hour by hour and see the analysis update.",
  "sim.open": "Open simulation",
  "sim.note":
    "Select Next hour to see how sales change, or Play to advance automatically. Finish day updates the suggested portions for tomorrow. Your stall data stays separate.",
  "sim.emptyTitle": "The simulation needs a demo stall",
  "sim.emptyBody": "Load a demo stall with at least one active menu.",
  "sim.day": "Day {day}: {date}",
  "sim.hours": "{done} of {total} hours simulated",
  "sim.dayDone": "Day closed. The next suggestions use it.",
  "sim.play": "Play",
  "sim.pause": "Pause",
  "sim.nextHour": "Next hour",
  "sim.nextDay": "Next day",
  "sim.finishDay": "Finish day",
  "sim.restart": "Restart",
  "sim.hourTitle": "Activity {from} to {to}",
  "sim.customers": "Customers",
  "sim.sold": "Sold",
  "sim.missed": "Turned away",
  "sim.turnedAway": "Sold out",
  "sim.transactions": "Transactions this hour",
  "sim.byHour": "Today by hour",
  "sim.col.hour": "Hour",
  "sim.col.sales": "Sales",
  "sim.col.estimate": "Demand (estimate)",
  "sim.col.truth": "Simulated demand",
  "sim.stock": "Stock",
  "sim.truthNote":
    "Simulated demand is known only inside the simulation. A real stall sees only the estimate.",
  "sim.analysis": "Analysis",
  "sim.pattern": "Customers per hour, average per simulated day",
  "sim.peak": "Busiest hour starts at {from}.",
  "sim.barValue": "{sold} sold, {missed} turned away",
  "sim.patternEmpty": "Run at least one hour to see the pattern.",
  "sim.menus": "Menus by profit per day",
  "sim.next": "Cook next: {qty} portions",
  "sim.menuStats":
    "Profit per day {profit}. Sold out {soldOut} of {days} days. Average left over {leftover}. Average demand {demand} (estimate).",
  "sim.menusNote":
    "Based on the last 14 normal closed days of each menu. Only menus already on the stall are compared.",
  "sim.signal.loss": "Losing money",
  "sim.signal.sellsOut": "Often sells out",
  "sim.signal.leftOver": "Often left over",
  "sim.signal.steady": "Steady",
  "case.title": "Case guide",
  "case.eyebrow": "Guided case",
  "case.intro":
    "Each demo stall is built to show one situation. Follow the four moments of its day. Each one says what to try and what FOODOO does, with numbers from this stall's own history.",
  "case.try": "Try this",
  "case.happens": "What happens",
  "case.open.plan": "Open the morning plan",
  "case.open.service": "Open sales",
  "case.open.close": "Open closing time",
  "case.open.summary": "Open the weekly summary",
  "case.resetNote":
    "Opening a moment sets the demo to that time of day and loads it again, so changes you made to the demo day are reset. The history stays the same.",
  "case.another":
    "To follow another case, press the Demo data badge at the top and choose a stall.",
  "case.stop": "Stop the guide",
  "case.back": "Back to the case guide",
  "case.note.label": "Case guide note",
  "case.card.title": "Follow a case",
  "case.card.body":
    "Each demo stall tells one story. Follow it moment by moment, with an explanation of what happens and why.",
  "case.card.open": "Open the case guide",
  "case.emptyTitle": "The case guide needs a demo stall",
  "case.emptyBody":
    "The guide follows the story of a demo stall. Your own stall is never changed. Open a demo stall first.",
  "case.unavailableTitle": "No menu to follow",
  "case.unavailableBody":
    "Every menu of this demo stall is archived. Restore one in Settings, or load the demo again.",
  "demo.launch.learnTitle": "Learn how it works with this stall",
  "demo.launch.tourName": "7-step tutorial",
  "demo.launch.tourBody":
    "Press the highlighted items through one full day. Each step also explains what happens in this stall and why.",
  "demo.launch.resume": "Continue the demo I already have",
  "demo.launch.resumeNote":
    "Opens Today without loading anything again. Or pick a stall below to start over.",
  "demo.launch.guideBody":
    "A step-by-step guide explains what happens in this stall at each moment of the day, using the numbers from its own history.",
  "case.start": "Start guided case",
  "case.s1.title": "A sold-out menu hides demand",
  "case.s1.situation":
    "{menu} is usually cooked at {usual} portions, yet it keeps selling out. A sold-out day only records what sold, not what people wanted, so a stall like this quietly loses sales. {menu2} is the opposite case, with portions left over. This stall shows FOODOO correcting both.",
  "case.s1.plan.try":
    "Open the morning plan. Compare the card for {menu} with the card for {menu2}.",
  "case.s1.plan.happens":
    "{menu}: “{why}”. FOODOO suggests {qty} portions instead of the usual {usual}. {menu2}: “{why2}”. It suggests {qty2} instead of {usual2}. The numbers come from the days the owner recorded, with the sold-out days corrected upwards.",
  "case.s1.service.try":
    "Open the Sales screen. The menu that runs out most often has already sold out. Tap another menu to mark it sold out as well.",
  "case.s1.service.happens":
    "A tap keeps one thing: the minute the menu ran out. FOODOO combines that minute with the stall's busy hours. If only half of the day's customers had arrived when it ran out, the real demand was about twice the portions cooked. Undo stays for 10 seconds.",
  "case.s1.close.try":
    "Open closing time. Enter what is left of the menus that did not sell out, then press Close day.",
  "case.s1.close.happens":
    "With leftovers, demand is the portions cooked minus the leftover, so it is exact. For a menu that sold out, FOODOO estimates demand from the sell-out time, never more than three times the portions cooked, and labels it an estimate. These numbers feed tomorrow's suggestion.",
  "case.s1.summary.try":
    "Open the weekly summary. Look at the leftovers, the sell-outs and the estimated lost sales.",
  "case.s1.summary.happens":
    "Menus that sell out, like {menu}, show estimated lost sales here. Menus with leftovers, like {menu2}, show money lost on wasted food. Tomorrow's number weighs the profit lost by running out against the cost of leftovers, so each menu gets its own number.",
  "case.s2.title": "One weekday is not another",
  "case.s2.situation":
    "An office lunch stall with one sharp noon rush. It is busy on weekdays and quiet at weekends, so one average would be wrong on most days. FOODOO compares each day with the same weekday instead.",
  "case.s2.plan.try":
    "Open the morning plan and read the reason on the {menu} card.",
  "case.s2.plan.happens":
    "{menu}: “{why}”. FOODOO looks at the same weekday in recent weeks, so {hiDay} get {hiQty} portions and {loDay} only {loQty}. {menu2} is a different story: “{why2}”. It suggests {qty2} against the usual {usual2}.",
  "case.s2.service.try":
    "Open the Sales screen and tap a menu that has not run out to mark it sold out.",
  "case.s2.service.happens":
    "The stall is open {open} to {close}, with its rush around noon. A menu that runs out before the rush peaks hides far more demand than one that runs out near closing, because most customers were still to come. FOODOO weighs the sell-out time by the busy hours.",
  "case.s2.close.try":
    "Open closing time. Enter the leftovers. If something odd happened today, such as rain or a holiday, switch on Unusual day.",
  "case.s2.close.happens":
    "A day marked unusual stays in the history but is ignored when suggesting. Ordinary weekday and weekend differences are not exceptions, because comparing the same weekday already handles them.",
  "case.s2.summary.try":
    "Open the weekly summary, then open one past day from the list.",
  "case.s2.summary.happens":
    "Each day shows what was cooked, what was suggested and the demand. Compare a weekday with a weekend day. The amounts differ because the demand differs, not because the owner changed their mind.",
  "case.s3.title": "A stall that closes after midnight",
  "case.s3.situation":
    "A night stall open {open} to {close}. Its day crosses midnight, so a sale at 01:00 belongs to the evening the stall opened, not to the next calendar day. Without that rule one night would be split into two days.",
  "case.s3.plan.try":
    "Open the plan. It is dated for the evening the stall opens, even if the clock has passed midnight.",
  "case.s3.plan.happens":
    "{menu}: “{why}”. FOODOO suggests {qty} against the usual {usual}. It compares with the same weekday of the evening the stall opened, so a Friday night that ends on Saturday at 01:00 still counts as Friday. {menu2}: {qty2} instead of {usual2}.",
  "case.s3.service.try": "Open the Sales screen and mark a menu sold out.",
  "case.s3.service.happens":
    "The time is kept on the stall's own clock, where after midnight counts as later than 23:00. A menu that runs out at 00:30 is correctly seen as running out late, near closing, not early in the day.",
  "case.s3.close.try":
    "Open closing time. Enter the leftovers and close the day, even when it is already past midnight.",
  "case.s3.close.happens":
    "The closed day is saved under the evening the stall opened. Demand is worked out the same way as for a daytime stall, using the busy hours between {open} and {close}.",
  "case.s3.summary.try": "Open the weekly summary and look at the latest days.",
  "case.s3.summary.happens":
    "Each night appears once, under the day it started. {hiDay} are the busiest evenings here, with {hiQty} portions of {menu}, and {loDay} the quietest, with {loQty}.",
  "case.s4.title": "A new stall with little history",
  "case.s4.situation":
    "This stall opened only {days} days ago. There is not enough history to learn from yet, so FOODOO starts from the usual portions and adjusts a little after each day.",
  "case.s4.plan.try":
    "Open the morning plan. Read the reasons on the {menu} and {menu2} cards.",
  "case.s4.plan.happens":
    "{menu}: “{why}”, so {qty} instead of {usual}. {menu2}: “{why2}”, so {qty2} instead of {usual2}. With so few days FOODOO moves by about a tenth and no more, because a few days can mislead. A suggestion based on a real pattern needs at least 5 comparable days.",
  "case.s4.service.try": "Open the Sales screen and mark a menu sold out.",
  "case.s4.service.happens":
    "The sell-out time is saved from the first day. It is turned into a demand estimate when the day is closed, and that estimate is what later suggestions are built from.",
  "case.s4.close.try":
    "Open closing time. Enter the leftovers and close the day.",
  "case.s4.close.happens":
    "Each closed day adds one more data point. {menu3} still earns {salvage3} for every unsold portion, so leftovers cost it little. Once there is enough history FOODOO leans towards cooking more of it, because its critical ratio is {ratio3}%.",
  "case.s4.summary.try":
    "Open the weekly summary. There are only a few days to show.",
  "case.s4.summary.happens":
    "With {days} days the charts are short, and that is honest. FOODOO labels estimates and does not pretend to know more than the days recorded. Keep recording and the suggestions turn from a starting point into a pattern.",
} as const;
