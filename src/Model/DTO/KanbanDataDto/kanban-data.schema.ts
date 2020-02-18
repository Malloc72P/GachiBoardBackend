import * as mongoose from 'mongoose';

export const KanbanDataSchema = new mongoose.Schema({
  todoGroup         :[ {type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_ITEM_MODEL"} ],
  inProgressGroup   :[ {type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_ITEM_MODEL"} ],
  doneGroup         :[ {type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_ITEM_MODEL"} ],

  kanbanTagListDto  :[ {type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_TAG_MODEL"} ],
});
