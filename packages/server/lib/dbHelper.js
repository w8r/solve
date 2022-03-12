module.exports.LATEST_REVISION_AGGREGATOR = [
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $group: {
      _id: '$publicId',
      internalId: {
        $first: '$_id'
      },
      createdAt: {
        $first: '$createdAt'
      },
      updatedAt: {
        $first: '$updatedAt'
      },
      data: {
        $first: '$data'
      },
      edges: {
        $first: '$edges'
      },
      nodes: {
        $first: '$nodes'
      },
      name: {
        $first: '$name'
      },
      resolved: {
        $first: '$resolved'
      },
      tags: {
        $first: '$tags'
      },
      user: {
        $first: '$user'
      },
      isPublic: {
        $first: '$isPublic'
      },
      publicId: {
        $first: '$publicId'
      },
      internalId: {
        $first: '$_id'
      }
    }
  },
  {
    $project: {
      _id: 0,
      name: {
        $ifNull: ['$name', 'Untitled']
      },
      isPublic: '$isPublic',
      resolved: '$resolved',
      createdAt: 1,
      updatedAt: 1,
      tags: '$tags',
      data: '$data',
      nodes: '$nodes',
      edges: '$edges',
      user: '$user',
      publicId: '$_id',
      internalId: '$internalId',
      updatedAt: '$updatedAt'
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  }
];

module.exports.FORK_COUNT_LATEST_REV_AGGREGATOR = [
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $lookup: {
      from: 'graphs',
      localField: 'publicId',
      foreignField: 'data.parentId',
      as: 'forks',
      pipeline: [
        {
          $group: {
            _id: '$publicId'
          }
        }
      ]
    }
  },
  {
    $group: {
      _id: '$publicId',
      internalId: {
        $first: '$_id'
      },
      createdAt: {
        $first: '$createdAt'
      },
      updatedAt: {
        $first: '$updatedAt'
      },
      data: {
        $first: '$data'
      },
      edges: {
        $first: '$edges'
      },
      nodes: {
        $first: '$nodes'
      },
      name: {
        $first: '$name'
      },
      resolved: {
        $first: '$resolved'
      },
      tags: {
        $first: '$tags'
      },
      user: {
        $first: '$user'
      },
      isPublic: {
        $first: '$isPublic'
      },
      publicId: {
        $first: '$publicId'
      },
      internalId: {
        $first: '$_id'
      },
      forks: {
        $first: '$forks'
      }
    }
  },
  {
    $project: {
      _id: 0,
      name: {
        $ifNull: ['$name', 'Untitled']
      },
      isPublic: '$isPublic',
      resolved: '$resolved',
      createdAt: 1,
      updatedAt: 1,
      tags: '$tags',
      data: '$data',
      nodes: '$nodes',
      edges: '$edges',
      user: '$user',
      publicId: '$_id',
      internalId: '$internalId',
      updatedAt: '$updatedAt',
      forks: {
        $size: '$forks'
      }
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  }
];

module.exports.USER_LOOKUP_PROJECTION = [
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'users'
    }
  },
  {
    $addFields: {
      user: {
        $arrayElemAt: ['$users', 0]
      }
    }
  },
  {
    $unset: [
      'users',
      'user.provider',
      'user.password',
      'user.status',
      'user.__v',
      'user.createdAt',
      'user.updatedAt',
      'user.email'
    ]
  }
];
