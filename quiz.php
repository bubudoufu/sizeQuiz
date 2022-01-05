<?php
session_start();

// ゲームスタート時のみ問題クリア数を初期化
if(isset($_POST['init'])){
    if($_POST['init'])
    {
        unset($_SESSION['clearCount']);
        $_SESSION['clearCount'] = 0;
    }
}
// セッション変数初期化
function init()
{
    unset($_SESSION['answer']);
    unset($_SESSION['count']);
}

// pdoインスタンス生成
function getPdoInstance()
{
try{
    $pdo = new PDO('sqlite:./test.sqlite'); //  PDOの引数に(sqlite:データベースのパス)で指定する
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // エラーが起きた時例外を投げる
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // 連想配列形式でデータを取得する
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); // 指定した型に合わせる

    return $pdo;
    
    }catch(PDOException $e){
    //echo $e->getMessage();
    exit('エラーが発生しました');
    }
}

// スタート画面でジャンルが選ばれた時の処理
if(isset($_POST['genre'])){
    $genre = ['prefecturesArea', 'mountain', 'river'];
    if(in_array($_POST['genre'], $genre, true)){
        init();
        echo makeQuiz();
    }
}

// 問題と答えを作成
function makeQuiz()
{
    $pdo = getPdoInstance();
    // 問題用　データベースからランダム問題の選択肢をに４つ抜き出す
    $stmt = $pdo->query("SELECT * FROM `{$_POST['genre']}` ORDER BY RANDOM() LIMIT 4");
    $stmts = $stmt->fetchAll();
    $json = json_encode($stmts, JSON_UNESCAPED_UNICODE);
    $answer = json_decode($json, true);
    $quiz = array_column($answer, 'name');
    $quiz = json_encode($quiz);
    
    // 答え合わせ用　大きい順に並び替え
    foreach($answer as $key => $value){
        $size[$key] = $value["size"];
    }
    // 答えに重複値があるかチェック無ければ問題を作成
    $value_count = array_count_values($size);
    $max = max($value_count);
    if($max == 1){
        array_multisort($size, SORT_DESC, $answer);
    // セッションで答えを保持
    $_SESSION['count'] = 0;
    foreach($answer as $key){
        $_SESSION['answer'][] = [$key['name'], $key['size']];
    }
        return $quiz;
    // 答えに重複値がある場合はもう一度クイズ作成
    }else{
        makeQuiz();
        return;
    }
}

// 回答が送られてきた時の処理
if(isset($_POST['answer'])){
    // 1問クリア
    if($_SESSION['count'] === 3){
        $_SESSION['clearCount']++;
        // 5問クリア
        if($_SESSION['clearCount'] === 5){
            echo sendAnswer('clear');
            return;
        }else{
            echo sendAnswer('next');
            return;
        }
    }
    // 答え合わせ
    // 正解
    if(filter_input(INPUT_POST, 'answer') == $_SESSION['answer'][$_SESSION['count']][0]){
        echo sendAnswer('correct');
        $_SESSION['count']++;
        return;
    }
    // 不正解
    else{
        echo sendAnswer('incorrent');
        return;
    }
}

function sendAnswer($resut)
{
    if($resut === 'incorrent'){
        $array = array('result'=>'incorrect', $_SESSION['answer']);
        $array = json_encode($array, JSON_UNESCAPED_UNICODE);
        return $array;
    }
    $array = array('result'=> $resut, 'size'=>$_SESSION['answer'][$_SESSION['count']][1]);
    $array = json_encode($array, JSON_UNESCAPED_UNICODE);
    return $array;
}


