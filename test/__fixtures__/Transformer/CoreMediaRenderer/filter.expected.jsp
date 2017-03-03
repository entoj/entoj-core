<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
${ model.text is empty ? '' : model.text }
${ model.text is empty ? '#Lipsum' : model.text }
${ model.text.concat('x').concat('y').concat('z') }
${ ['one', two] is empty ? '' : ['one', two] }
