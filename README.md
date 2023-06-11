# 사용스택
- express : 웹 프레임워크 서버
- express-handlebars : 웹 애플리케이션 템플릿 엔진
- lodash : 페이징 기능을 할때, 페이지 범위생성에 사용
- mongodb : 게시판, 댓글 저장 DB
- mongoose : mongodb를 간편하게 사용해주는 모델링 도구로, 스키마정의 등의 기능을 제공
- nodemon : 소스코드 변경이 감지되면, 자동으로 서버를 재시작



<br><br>
서버사이드 렌더링(SSR)이기 때문에, 서버와 클라이언트가 구분이되지는 않지만,<br>
개념적으로 분리 해보았다.

# 소스 구조
## 서버
- app.js : express를 사용한 http 통신을 사용하는 주체로 사용
- configs/ : 설정파일 모음
  - mongodb-connection.js : mongodb의 인증 및 Object 반환
  - handlebars-helpers.js : 미리 저장해놓은 함수로 Client에서 표시하기 편하게 도와준다.
- services/ : 실제 사용할 비즈니스로직을 담은 공간
  - post-service.js : 파일명은 post이지만, get, delete등의 메서드도 사용한다.

## 클라이언트
- utils/ : 편의를 위한 함수를 담은 공간
  - paginator.js : 페이지네이션 기능 구현에 필요한 데이터를 가공해서 반환해준다.
- views/layouts/ : 웹의 각 템플릿들의 저장 공간
- views/.handlebars : 템플릿에 넣어줄 웹 소스파일
  - 백엔드의 기능연습을 위해 작성한 소스로, 클라이언트는 따로 작성하지 않았다.