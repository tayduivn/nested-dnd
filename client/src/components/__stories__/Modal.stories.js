import React from "react";
import { storiesOf } from "@storybook/react";

import Modal from "../Modal";
import Button from "../Button";

storiesOf("Modal", module).add("default", () => (
	<Modal onClose={() => alert("closing!")}>
		<Modal.Header>Dialog header</Modal.Header>
		<Modal.Body>Body of the dialog</Modal.Body>
		<Modal.Footer>
			<Button>Action</Button>
			<Button>Cancel</Button>
		</Modal.Footer>
	</Modal>
));

storiesOf("Modal", module).add("scrolling body", () => (
	<Modal onClose={() => alert("closing!")} scroll={true}>
		<Modal.Header>Scrolling body</Modal.Header>
		<Modal.Body>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse condimentum, ex nec
				tempus placerat, ligula dui pulvinar est, et bibendum lacus orci nec dolor. Proin faucibus,
				orci a commodo luctus, arcu mi tincidunt nulla, id viverra metus turpis ac risus.
				Suspendisse potenti. Ut placerat mauris sed turpis sollicitudin, eget suscipit quam
				ullamcorper. Vivamus et nisi sed arcu venenatis fringilla ac vitae urna. Curabitur malesuada
				lectus vitae commodo molestie. Vivamus nunc tellus, molestie ut odio a, euismod pharetra
				arcu. Donec porta pulvinar leo, non rhoncus justo scelerisque non. Sed tincidunt aliquet
				nisl, non ornare tellus bibendum quis.
			</p>
			<p>
				Morbi sit amet imperdiet leo. Integer non orci rutrum quam pretium suscipit. Nam egestas mi
				eget porttitor pharetra. Cras vestibulum dui porta, lacinia ligula lobortis, placerat nunc.
				Sed eget massa non turpis maximus elementum sit amet eu nunc. Nunc semper justo nec tellus
				fringilla, ac congue neque pharetra. Quisque vestibulum bibendum hendrerit. In lobortis,
				velit pellentesque volutpat ornare, erat tortor malesuada arcu, sed lacinia lorem eros a
				risus.
			</p>
			<p>
				Nam gravida odio vel vestibulum bibendum. Sed feugiat tristique tellus at vulputate. Sed
				fermentum eros semper mauris pretium rhoncus. Maecenas semper ullamcorper eleifend. Donec at
				pulvinar tortor. Aenean tempor enim placerat dolor tempor, at eleifend est posuere.
				Vestibulum vel aliquam libero, at finibus magna.
			</p>
			<p>
				Donec vel arcu a urna cursus consectetur. Aliquam sed aliquam justo, et faucibus erat.
				Aenean et nulla cursus, luctus erat vel, rutrum massa. Pellentesque euismod urna a enim
				iaculis auctor. Cras id risus finibus, suscipit odio non, finibus lectus. Pellentesque
				habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam leo
				mauris, sagittis nec convallis at, lobortis in enim. Donec accumsan vehicula tempor.
				Suspendisse imperdiet, mi rutrum pharetra fermentum, neque libero posuere nisi, tempus
				interdum nibh libero id libero. Sed quis tempor quam, sit amet dapibus lectus. Vivamus
				elementum neque ligula, in viverra est sagittis ut. Cras dapibus pretium dignissim.
				Pellentesque justo felis, finibus et tortor eu, tincidunt blandit nisi. Donec sed turpis
				ante.
			</p>
			<p>
				Morbi lacinia nunc sed odio scelerisque, sed bibendum sem lobortis. Suspendisse metus lacus,
				laoreet nec diam a, efficitur lobortis ligula. Cras et tempor nisi, id feugiat ante.
				Phasellus erat quam, gravida quis aliquet ut, viverra tempor magna. Morbi tempor massa sit
				amet nibh suscipit pretium. Curabitur pulvinar iaculis lacus, ut fermentum magna suscipit a.
				Aenean bibendum justo quam, in malesuada urna imperdiet sit amet. Nulla faucibus metus
				augue, eu semper nulla molestie sagittis. Praesent arcu ipsum, finibus et dignissim nec,
				lobortis quis est. Suspendisse sed enim arcu.
			</p>
			<p>
				Donec enim ipsum, semper a metus eget, euismod vulputate dolor. Donec et luctus ex.
				Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis
				euismod eget orci in vestibulum. Aenean euismod arcu vel mi scelerisque faucibus. Fusce
				metus ex, lobortis id augue tempor, scelerisque molestie libero. Cras lorem massa, suscipit
				nec interdum non, molestie in tortor.
			</p>
			<p>
				Praesent vitae rhoncus lorem. Cras porta aliquam diam at hendrerit. Cras aliquam risus
				interdum orci bibendum vestibulum. Nullam rhoncus ultrices libero, sed porttitor nulla
				commodo faucibus. Nunc porta molestie congue. Donec venenatis ante a mi maximus, in lobortis
				dolor viverra. In sodales odio ac pulvinar molestie. Orci varius natoque penatibus et magnis
				dis parturient montes, nascetur ridiculus mus. Vestibulum luctus vehicula massa. Proin id
				dui blandit, pellentesque tortor eu, egestas risus. Maecenas tincidunt sagittis pharetra.
				Nullam placerat massa eu elit euismod, nec mattis tellus sagittis. Donec blandit, quam vel
				ultricies lobortis, nunc magna feugiat ex, id lobortis felis libero id lacus. Vestibulum at
				euismod augue, ornare porta metus. Nullam at consequat velit. Vestibulum commodo, arcu et
				porttitor maximus, augue magna sollicitudin neque, id rutrum ligula erat eget neque.
			</p>
			<p>
				Sed eget pellentesque diam. Fusce mattis gravida arcu, a pellentesque neque vestibulum sed.
				Aliquam viverra, nibh vel cursus tincidunt, felis odio posuere sem, eu malesuada libero mi
				eget nisl. Praesent magna risus, consectetur sit amet gravida eu, volutpat ac sapien. Fusce
				bibendum ac lectus non bibendum. Nulla scelerisque mi at imperdiet faucibus. Quisque eget
				dolor lorem. Nullam ac urna vitae est sollicitudin posuere nec ac odio. Vestibulum elementum
				libero ac dui blandit hendrerit. Duis arcu justo, interdum vel interdum et, consequat ac
				ante.
			</p>
			<p>
				Aenean vitae massa ligula. Aliquam dignissim erat risus, vel tempor lectus porttitor nec.
				Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
				Morbi risus nisl, congue sit amet turpis sed, pellentesque cursus sapien. Sed eu risus
				elementum, sollicitudin augue hendrerit, tempor velit. Mauris eget mattis lectus, sed
				imperdiet augue. Etiam suscipit velit eget sapien condimentum, a pellentesque magna dapibus.
				Aliquam erat volutpat. Quisque in velit sed justo sodales pellentesque. Sed fermentum, elit
				ac laoreet feugiat, ex mauris maximus augue, at tempor purus augue ac nunc. Quisque vitae
				elementum urna. Praesent sit amet leo malesuada, pulvinar massa eu, imperdiet nibh. Nulla
				facilisi. In viverra mi in diam finibus sodales. Donec venenatis a ipsum eget porta.
			</p>
			<p>
				Cras eget suscipit ante. Morbi porttitor massa erat, in tristique arcu aliquet vitae.
				Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
				egestas. Nullam commodo eu nunc quis feugiat. Donec eget odio congue, auctor nibh nec,
				rutrum ipsum. Nam sed rutrum arcu, ac posuere eros. Vestibulum ante ipsum primis in faucibus
				orci luctus et ultrices posuere cubilia Curae; Vivamus elementum dolor iaculis eros
				tincidunt ornare. Fusce sed vulputate ex. Vestibulum varius orci leo, vel gravida lorem
				malesuada eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
				cubilia Curae;
			</p>
			<p>
				Morbi aliquam a lectus nec faucibus. Suspendisse vulputate nisi nec facilisis mollis. Duis
				iaculis ante magna, a porta mi euismod id. Duis luctus ultricies turpis quis ullamcorper.
				Nulla vitae eros aliquet justo porta sagittis. Praesent non lobortis sapien. Nulla in
				venenatis nisi. Etiam sit amet ante vel ligula efficitur suscipit. Curabitur fermentum risus
				at purus cursus lobortis. Curabitur pellentesque quis ante in molestie. Pellentesque
				habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla
				facilisis est metus, non ullamcorper elit suscipit a. Nulla dictum erat turpis, aliquam
				convallis magna imperdiet eget. Phasellus tempor neque a molestie elementum.
			</p>
			<p>
				Maecenas et dapibus justo. Nulla in scelerisque tellus, id dapibus est. Sed rutrum lectus
				nisl, sodales porttitor odio sollicitudin dictum. Nam fermentum enim congue, malesuada est
				vel, fringilla eros. Duis non nibh tempor, auctor massa nec, lacinia diam. Cras lorem
				ligula, lacinia sit amet sem sed, pellentesque dignissim augue. Mauris in urna rutrum,
				imperdiet nisi eget, semper orci. Sed magna dui, interdum et tempor vel, viverra vel nunc.
				Vestibulum eget tincidunt magna, a consectetur elit. Proin libero augue, volutpat vitae
				ipsum pellentesque, auctor venenatis neque. Curabitur at lectus at nisi convallis blandit.
				Donec imperdiet mollis nisi, sit amet laoreet nulla accumsan eu. Nam congue nibh elit, eget
				vulputate est luctus ac. In mattis ultricies tempor. In placerat sem augue, eget convallis
				quam vestibulum sed.
			</p>
			<p>
				Maecenas placerat, lorem ac lacinia vehicula, turpis sem tristique velit, et iaculis leo
				velit eget ex. Suspendisse lobortis, nisl sit amet vehicula auctor, elit turpis porta velit,
				in fringilla ligula nunc sit amet elit. Proin pretium diam tempus, tincidunt velit vitae,
				blandit magna. Phasellus laoreet nibh ac nibh sollicitudin, id pharetra magna pulvinar.
				Proin porta ante vel velit facilisis malesuada. Aliquam erat volutpat. Vestibulum ante ipsum
				primis in faucibus orci luctus et ultrices posuere cubilia Curae; Integer auctor at turpis
				et aliquet. Vivamus vel nisi nec arcu tempus scelerisque in ut urna. Vivamus vitae commodo
				odio. Suspendisse potenti. Proin eget est nec arcu convallis sagittis.
			</p>
			<p>
				Mauris mollis euismod imperdiet. Nunc interdum nulla quis lectus placerat, in consequat
				metus molestie. Suspendisse et blandit justo. Ut ullamcorper sodales odio, et luctus odio
				suscipit ut. Donec et dui est. Morbi vitae urna at elit tempus ultricies. Curabitur augue
				est, aliquet vel mi id, varius tincidunt ante. Suspendisse potenti. Pellentesque vel nisl
				nec magna ornare tristique. In aliquam et odio eu iaculis. Duis convallis nisl ut eros
				aliquet faucibus. Morbi vel bibendum ligula, sed pharetra mi. Nulla ac tortor sit amet leo
				rutrum semper nec rhoncus turpis. Ut eget elit semper, fringilla dolor a, dapibus orci.
				Quisque sagittis risus maximus leo elementum molestie vitae sed turpis. Morbi in ornare ex.
			</p>
			<p>
				In porttitor rhoncus posuere. Phasellus libero neque, pretium at faucibus eget, tempus in
				est. Donec pellentesque fermentum risus, sit amet finibus orci bibendum non. Suspendisse
				potenti. Suspendisse posuere pellentesque mi nec commodo. Praesent in erat et lorem suscipit
				ultrices. Vestibulum vehicula nisl diam, a pretium libero luctus a.
			</p>
			<p>
				Proin vel turpis eu enim facilisis hendrerit. In viverra vehicula neque, vel dictum neque
				scelerisque sed. Sed sed magna sed quam dapibus vestibulum ac sit amet ex. Integer ex erat,
				lacinia sit amet odio eu, dictum ullamcorper dolor. Donec at erat augue. Suspendisse dapibus
				felis tellus, at consectetur arcu condimentum vitae. Nunc at scelerisque mauris. Donec
				eleifend, ante non auctor posuere, libero sem semper nisl, non accumsan ante neque id elit.
				Maecenas in rutrum dolor. Nunc pellentesque elit id massa pretium placerat in et libero.
				Nulla facilisi. Integer ut feugiat justo. Suspendisse elit felis, elementum in ante vitae,
				gravida consectetur nulla. Ut ullamcorper est nec tortor porta accumsan. Suspendisse
				tincidunt lacus ut pharetra vulputate. Sed ac magna elit.
			</p>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a lobortis arcu. Orci varius
				natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut molestie at
				nisl in dictum. Duis ut turpis vel ligula bibendum volutpat. Aliquam felis dolor, accumsan
				non volutpat id, tempus non elit. Phasellus nec magna et augue scelerisque interdum sed in
				neque. Suspendisse potenti. In fermentum rhoncus est, sit amet pretium purus vestibulum
				eget. Ut hendrerit velit sed odio eleifend, a imperdiet ante laoreet. Integer non augue vel
				leo commodo porta quis quis odio. Donec pellentesque libero a ante volutpat elementum.
			</p>
			<p>
				Vestibulum mattis ac est vitae tempus. Fusce tincidunt nibh non orci venenatis convallis.
				Proin consectetur bibendum efficitur. Vestibulum efficitur, ex id aliquam feugiat, nibh nunc
				ullamcorper turpis, ac mollis dolor magna in velit. Pellentesque aliquam neque ut leo
				convallis ultrices. Pellentesque elementum in mauris pellentesque iaculis. Quisque quis
				cursus felis. Nam tincidunt quis purus in vulputate. Etiam nec nibh malesuada, auctor purus
				sed, scelerisque erat. Curabitur posuere cursus erat, et eleifend eros laoreet sit amet.
				Nulla non rhoncus nisi, condimentum finibus felis. Mauris nisl lectus, tempus vel accumsan
				quis, convallis et lacus. Curabitur pretium ex dui, sit amet semper mauris venenatis ac.
			</p>
			<p>
				Fusce convallis augue id tellus condimentum auctor. Praesent tincidunt fermentum congue. Sed
				sed iaculis turpis. Pellentesque vitae quam ullamcorper, malesuada quam in, vulputate elit.
				Suspendisse potenti. Aenean nisl ex, tempus id leo nec, pulvinar finibus elit. Donec
				efficitur sed nunc ut cursus. Orci varius natoque penatibus et magnis dis parturient montes,
				nascetur ridiculus mus.
			</p>
			<p>
				In volutpat nunc eget risus accumsan, vitae auctor magna cursus. Proin in odio nibh. Quisque
				blandit porttitor turpis nec sodales. Donec eget hendrerit nisi, in convallis lorem. In et
				orci id lacus molestie aliquet id non nisi. Suspendisse volutpat, felis nec pellentesque
				dignissim, nisi nunc eleifend nulla, sit amet mollis sapien massa sed mi. Integer rutrum dui
				sed sem accumsan imperdiet. Duis sagittis lectus ut condimentum ornare. Donec eget pretium
				risus, ut cursus metus. Cras commodo elit elit, non fringilla dolor congue quis. Cras vitae
				iaculis ante. Nulla in lectus ac ante semper sodales vel quis purus.
			</p>
		</Modal.Body>
		<Modal.Footer>
			<Button>Action</Button>
		</Modal.Footer>
	</Modal>
));
