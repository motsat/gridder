var ACTION_TYPE     = {'REQUEST_CREATE' : 'REQUEST_CREATE' ,  // クライアントからの作成要求
                       'CREATE'         : 'CREATE'         ,  // クラインとへの作成指示（REQUEST_CREATE後)
                       'REQUEST_LOCK'   : 'REQUEST_LOCK'   ,  // サーバへのロック要求
                       'LOCK'           : 'LOCK'           ,   // クラインとへのロック指示(REQUEST_EDIT)要求クライアント以外に送るもの
                       'REQUEST_EDIT'   : 'REQUEST_EDIT'   ,  // サーバへの編集要求
                       'EDIT'           : 'EDIT'              // クライントへの編集指示（REQUEST_EDIT後)
},

  OBJECT_TYPE     = {"CIRCLE":"1", "PATH":"2"},
  OBJECT_STATUS   = {"LOCK":"1", "NONE":"0"};
