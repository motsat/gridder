var ACTION_TYPE   = {'REQUEST_CREATE' : 1,  // クライアントからの作成要求
                     'CREATE'         : 2,  // クラインとへの作成指示（REQUEST_CREATE後)
                     'REQUEST_LOCK'   : 3,  // サーバへのロック要求
                     'LOCK'           : 4,   // クラインとへのロック指示(REQUEST_EDIT)を要求したクライアント以外に送るもの
                     'REQUEST_EDIT'   : 5,  // サーバへの編集要求
                     'EDIT'           : 6   // クライントへの編集指示（REQUEST_EDIT後)
};

