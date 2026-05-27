import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.");
    }
  }
  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    type?: string[];
    assignedTo?: string[];
    assignedBy?: string[];
    iteration?: string;
    keyword?: string;
    startDateFrom?: string;
    startDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  // Project Filter
  if (filters.projectId) {
    query.project = filters.projectId;
  }

  // Status Filter
  if (filters.status && filters.status.length > 0) {
    query.status = {
      $in: filters.status,
    };
  }

  // Priority Filter
  if (filters.priority && filters.priority.length > 0) {
    query.priority = {
      $in: filters.priority,
    };
  }

  // Type Filter
  if (filters.type && filters.type.length > 0) {
    query.type = {
      $in: filters.type,
    };
  }

  // Assigned To Filter
  if (filters.assignedTo && filters.assignedTo.length > 0) {
    query.assignedTo = {
      $in: filters.assignedTo,
    };
  }

  // Assigned By Filter
  if (filters.assignedBy && filters.assignedBy.length > 0) {
    query.assignedBy = {
      $in: filters.assignedBy,
    };
  }

  // Iteration Filter
  if (filters.iteration) {
    query.iteration = filters.iteration;
  }

  // Keyword Search
  if (filters.keyword) {
    query.$or = [
      {
        title: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        description: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
      {
        taskCode: {
          $regex: filters.keyword,
          $options: "i",
        },
      },
    ];
  }

  // Start Date Range Filter
  if (filters.startDateFrom || filters.startDateTo) {
    query.startDate = {};

    if (filters.startDateFrom) {
      query.startDate.$gte = new Date(filters.startDateFrom);
    }

    if (filters.startDateTo) {
      query.startDate.$lte = new Date(filters.startDateTo);
    }
  }

  // Due Date Range Filter
  if (filters.dueDateFrom || filters.dueDateTo) {
    query.dueDate = {};

    if (filters.dueDateFrom) {
      query.dueDate.$gte = new Date(filters.dueDateFrom);
    }

    if (filters.dueDateTo) {
      query.dueDate.$lte = new Date(filters.dueDateTo);
    }
  }

  // Pagination Setup
  const { pageSize, pageNumber } = pagination;

  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })

      .populate(
        "assignedTo",
        "_id name email profilePicture"
      )

      .populate(
        "assignedBy",
        "_id name email profilePicture"
      )

      .populate(
        "createdBy",
        "_id name email profilePicture"
      )

      .populate(
        "project",
        "_id emoji name"
      ),

    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,

    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};