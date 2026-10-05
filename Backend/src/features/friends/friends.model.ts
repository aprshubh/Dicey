import { Schema, model, Types } from 'mongoose';
import { IFriendship } from './friends.interface';

const friendshipSchema = new Schema<IFriendship>(
  {
    userA: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userB: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
      index: true,
    },
    actionUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Unique Index: Guarantees exactly one relationship record between any pair of users
friendshipSchema.index({ userA: 1, userB: 1 }, { unique: true });
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

/**
 * Utility to order two User ObjectIds canonically
 */
export const getCanonicalPair = (
  id1: Types.ObjectId | string,
  id2: Types.ObjectId | string
): { userA: Types.ObjectId; userB: Types.ObjectId } => {
  const str1 = id1.toString();
  const str2 = id2.toString();

  const oid1 = new Types.ObjectId(str1);
  const oid2 = new Types.ObjectId(str2);

  if (str1 < str2) {
    return { userA: oid1, userB: oid2 };
  } else {
    return { userA: oid2, userB: oid1 };
  }
};

export const Friendship = model<IFriendship>('Friendship', friendshipSchema);
